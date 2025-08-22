import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';

export const customersApi = {
  // Récupérer tous les clients uniques
  async getAll(page = 1, limit = 20, search?: string) {
    // Requête pour obtenir les clients distincts avec leurs statistiques
    let query = supabase
      .from('bookings')
      .select('guest_email, guest_phone, total_amount, created_at, passenger_details', { count: 'exact' });

    if (search) {
      query = query.or(`guest_email.ilike.%${search}%,guest_phone.ilike.%${search}%`);
    }

    const { data: bookings, error } = await query;
    
    if (error) throw error;

    // Grouper par email pour avoir des clients uniques
    const customersMap = new Map<string, Customer>();
    
    // Pour stocker les tags et notes par client
    const customerMetadata = new Map<string, { tags: Set<string>, notes: string | null }>();
    
    bookings?.forEach(booking => {
      if (!booking.guest_email) return; // Ignorer les réservations sans email
      
      const existing = customersMap.get(booking.guest_email);
      
      // Extraire le nom du passenger_details
      const passengerName = booking.passenger_details?.passengers?.[0]?.name || 
                          booking.guest_email.split('@')[0] || 
                          'Client';
      
      // Pour l'instant pas de metadata pour tags/notes
      const tags: string[] = [];
      const notes: string | null = null;
      
      if (existing) {
        existing.booking_count++;
        existing.total_spent += booking.total_amount;
        if (!existing.last_booking_date || new Date(booking.created_at) > new Date(existing.last_booking_date)) {
          existing.last_booking_date = booking.created_at;
        }
        
        // Fusionner les tags
        const existingMeta = customerMetadata.get(booking.guest_email)!;
        tags.forEach((tag: string) => existingMeta.tags.add(tag));
        if (notes && !existingMeta.notes) {
          existingMeta.notes = notes;
        }
      } else {
        customersMap.set(booking.guest_email, {
          customer_email: booking.guest_email,
          customer_name: passengerName,
          customer_phone: booking.guest_phone || '',
          booking_count: 1,
          total_spent: booking.total_amount,
          last_booking_date: booking.created_at,
          tags: null,
          notes: null
        });
        
        customerMetadata.set(booking.guest_email, {
          tags: new Set(tags),
          notes: notes
        });
      }
    });
    
    // Ajouter les tags et notes aux clients
    customersMap.forEach((customer, email) => {
      const meta = customerMetadata.get(email);
      if (meta) {
        customer.tags = Array.from(meta.tags);
        customer.notes = meta.notes;
      }
    });

    const customers = Array.from(customersMap.values());
    
    // Trier par dernière réservation
    customers.sort((a, b) => {
      if (!a.last_booking_date) return 1;
      if (!b.last_booking_date) return -1;
      return new Date(b.last_booking_date).getTime() - new Date(a.last_booking_date).getTime();
    });

    // Pagination manuelle
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCustomers = customers.slice(start, end);

    return {
      data: paginatedCustomers,
      count: customers.length,
      page,
      totalPages: Math.ceil(customers.length / limit)
    };
  },

  // Récupérer un client par email
  async getByEmail(email: string) {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('guest_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!bookings || bookings.length === 0) {
      throw new Error('Client non trouvé');
    }

    // Extraire le nom du premier passager
    const passengerName = bookings[0].passenger_details?.passengers?.[0]?.name || 
                         bookings[0].guest_email?.split('@')[0] || 
                         'Client';

    const customer: Customer = {
      customer_email: bookings[0].guest_email || '',
      customer_name: passengerName,
      customer_phone: bookings[0].guest_phone || '',
      booking_count: bookings.length,
      total_spent: bookings.reduce((sum, b) => sum + b.total_amount, 0),
      last_booking_date: bookings[0].created_at,
      tags: [],
      notes: null
    };

    return customer;
  },

  // Statistiques clients
  async getStats() {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('guest_email, total_amount, created_at');

    if (error) throw error;

    const uniqueCustomers = new Set(bookings?.map(b => b.guest_email).filter(Boolean)).size;
    const totalRevenue = bookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
    
    // Clients récurrents (plus d'une réservation)
    const customerCounts = new Map<string, number>();
    bookings?.forEach(b => {
      if (b.guest_email) {
        customerCounts.set(b.guest_email, (customerCounts.get(b.guest_email) || 0) + 1);
      }
    });
    const recurringCustomers = Array.from(customerCounts.values()).filter(count => count > 1).length;

    // Nouveaux clients ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = new Set(
      bookings
        ?.filter(b => new Date(b.created_at) >= startOfMonth && b.guest_email)
        .map(b => b.guest_email)
    ).size;

    return {
      totalCustomers: uniqueCustomers,
      recurringCustomers,
      averageOrderValue: totalRevenue / (bookings?.length || 1),
      newCustomersThisMonth,
      conversionRate: (recurringCustomers / uniqueCustomers) * 100
    };
  },

  // Créer/Mettre à jour les notes d'un client
  async updateNotes(email: string, notes: string) {
    // Comme nous n'avons pas de table customers séparée, 
    // nous stockons les notes dans metadata de la dernière réservation
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, metadata')
      .eq('guest_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new Error('Client non trouvé');
    }

    const metadata = bookings[0].metadata || {};
    const updatedMetadata = { ...metadata, customer_notes: notes };

    const { data, error } = await supabase
      .from('bookings')
      .update({ metadata: updatedMetadata })
      .eq('id', bookings[0].id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Ajouter un tag à un client
  async addTag(email: string, tag: string) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, metadata')
      .eq('guest_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new Error('Client non trouvé');
    }

    const metadata = bookings[0].metadata || {};
    const tags = metadata.customer_tags || [];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
    
    const updatedMetadata = { ...metadata, customer_tags: tags };

    const { data, error } = await supabase
      .from('bookings')
      .update({ metadata: updatedMetadata })
      .eq('id', bookings[0].id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un tag d'un client
  async removeTag(email: string, tag: string) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, metadata')
      .eq('guest_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new Error('Client non trouvé');
    }

    const metadata = bookings[0].metadata || {};
    const tags = metadata.customer_tags || [];
    const updatedTags = tags.filter((t: string) => t !== tag);
    
    const updatedMetadata = { ...metadata, customer_tags: updatedTags };

    const { data, error } = await supabase
      .from('bookings')
      .update({ metadata: updatedMetadata })
      .eq('id', bookings[0].id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Envoyer un email à un client
  async sendEmail(email: string, subject: string, content: string) {
    // Intégration avec service d'email
    // Pour l'instant, on simule l'envoi
    console.log('Envoi email à:', email, subject, content);
    
    // Enregistrer l'historique de communication dans metadata
    await this.addCommunicationHistory(email, {
      type: 'email',
      subject,
      content,
      sentAt: new Date().toISOString()
    });
    
    return { success: true };
  },

  // Ajouter à l'historique de communication
  async addCommunicationHistory(email: string, communication: any) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, metadata')
      .eq('guest_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new Error('Client non trouvé');
    }

    const metadata = bookings[0].metadata || {};
    const history = metadata.communication_history || [];
    history.push(communication);
    
    const updatedMetadata = { ...metadata, communication_history: history };

    const { data, error } = await supabase
      .from('bookings')
      .update({ metadata: updatedMetadata })
      .eq('id', bookings[0].id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};