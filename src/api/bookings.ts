import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export const bookingsApi = {
  // Récupérer toutes les réservations avec pagination
  async getAll(page = 1, limit = 20, filters?: {
    status?: Booking['status'];
    booking_type?: Booking['booking_type'];
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: string;
    amountMax?: string;
    customer_email?: string;
    packageSubtype?: string;
  }) {
    let query = supabase
      .from('bookings')
      .select('*, payments(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Appliquer les filtres
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.booking_type) {
      query = query.eq('booking_type', filters.booking_type);
    }
    if (filters?.search) {
      query = query.or(`guest_email.ilike.%${filters.search}%,guest_phone.ilike.%${filters.search}%`);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      // Ajouter 23:59:59 à la date de fin pour inclure toute la journée
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endDate.toISOString());
    }
    if (filters?.amountMin) {
      query = query.gte('total_amount', parseFloat(filters.amountMin));
    }
    if (filters?.amountMax) {
      query = query.lte('total_amount', parseFloat(filters.amountMax));
    }
    if (filters?.customer_email) {
      query = query.ilike('guest_email', `%${filters.customer_email}%`);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Ajouter les champs de compatibilité pour chaque booking
    const bookingsWithCompat = data?.map(booking => ({
      ...booking,
      customer_email: booking.guest_email,
      customer_name: booking.passenger_details?.passengers?.[0]?.name || booking.guest_email?.split('@')[0] || 'Client',
      customer_phone: booking.guest_phone
    })) || [];
    
    return {
      data: bookingsWithCompat,
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Récupérer une réservation par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, payments(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle réservation
  async create(booking: BookingInsert) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une réservation
  async update(id: string, updates: BookingUpdate) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut
  async updateStatus(id: string, status: Booking['status']) {
    return this.update(id, { status, updated_at: new Date().toISOString() });
  },

  // Supprimer une réservation (soft delete en changeant le statut)
  async delete(id: string) {
    return this.updateStatus(id, 'cancelled');
  },

  // Récupérer les réservations d'un client
  async getByCustomer(email: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('guest_email', email)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Ajouter les champs de compatibilité
    const bookingsWithCompat = data?.map(booking => ({
      ...booking,
      customer_email: booking.guest_email,
      customer_name: booking.passenger_details?.passengers?.[0]?.name || booking.guest_email?.split('@')[0] || 'Client',
      customer_phone: booking.guest_phone
    })) || [];
    
    return bookingsWithCompat;
  },

  // Statistiques
  async getStats() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    // Statistiques générales - utilisons des requêtes directes
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay);

    // Nombre de clients uniques
    const { data: customers } = await supabase
      .from('bookings')
      .select('guest_email');
    
    const uniqueCustomers = new Set(customers?.map(c => c.guest_email).filter(Boolean)).size;

    // Revenus par période
    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
      supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'confirmed')
        .gte('created_at', startOfDay),
      supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'confirmed')
        .gte('created_at', startOfWeek),
      supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'confirmed')
        .gte('created_at', startOfMonth)
    ]);

    return {
      general: {
        totalBookings: totalBookings || 0,
        todayBookings: todayBookings || 0,
        activeCustomers: uniqueCustomers
      },
      revenue: {
        today: todayRevenue.data?.reduce((sum, b) => sum + b.total_amount, 0) || 0,
        week: weekRevenue.data?.reduce((sum, b) => sum + b.total_amount, 0) || 0,
        month: monthRevenue.data?.reduce((sum, b) => sum + b.total_amount, 0) || 0
      }
    };
  },

  // Abonnement temps réel
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, callback)
      .subscribe();
  }
};