import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export const paymentsApi = {
  // Récupérer tous les paiements
  async getAll(page = 1, limit = 20, filters?: {
    status?: Payment['status'];
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = supabase
      .from('payments')
      .select('*, bookings(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  // Récupérer un paiement par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, bookings(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Statistiques des paiements
  async getStats(period?: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // Depuis le début
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const stats = {
      total: payments?.length || 0,
      success: payments?.filter(p => p.status === 'success').length || 0,
      failed: payments?.filter(p => p.status === 'failed').length || 0,
      pending: payments?.filter(p => p.status === 'pending').length || 0,
      cancelled: payments?.filter(p => p.status === 'cancelled').length || 0,
      totalAmount: payments?.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0) || 0,
      averageAmount: 0,
      successRate: 0
    };

    if (stats.success > 0) {
      stats.averageAmount = stats.totalAmount / stats.success;
      stats.successRate = (stats.success / stats.total) * 100;
    }

    return stats;
  },

  // Graphique des paiements par jour
  async getChartData(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Grouper par jour
    const dailyData = new Map<string, { date: string; success: number; failed: number; total: number }>();

    // Initialiser tous les jours
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyData.set(dateKey, {
        date: dateKey,
        success: 0,
        failed: 0,
        total: 0
      });
    }

    // Remplir avec les données réelles
    payments?.forEach(payment => {
      const dateKey = payment.created_at.split('T')[0];
      const dayData = dailyData.get(dateKey);
      
      if (dayData) {
        if (payment.status === 'success') {
          dayData.success += payment.amount;
          dayData.total += payment.amount;
        } else if (payment.status === 'failed') {
          dayData.failed += payment.amount;
        }
      }
    });

    return Array.from(dailyData.values());
  },

  // Créer un nouveau paiement
  async create(payment: PaymentInsert) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un paiement
  async update(id: string, updates: PaymentUpdate) {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un paiement (soft delete)
  async delete(id: string) {
    return this.update(id, { status: 'cancelled' });
  },

  // Retry un paiement échoué
  async retry(paymentId: string) {
    // Logique pour relancer un paiement via PayTech
    // Pour l'instant, on simule
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status: 'pending',
        updated_at: new Date().toISOString() 
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les paiements d'une réservation
  async getByBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};