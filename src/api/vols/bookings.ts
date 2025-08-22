import { supabase } from '../../lib/supabase';

export interface FlightBooking {
  id: string;
  user_id?: string;
  booking_type: 'flight' | 'hotel' | 'package';
  external_booking_id?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  total_amount: number;
  currency: string;
  base_amount?: number;
  commission_percentage?: number;
  commission_amount?: number;
  display_currency?: string;
  passenger_details: any;
  flight_details: any;
  guest_email?: string;
  guest_phone?: string;
  metadata?: any;
  package_subtype?: string;
  created_at: string;
  updated_at?: string;
}

export const bookingsAPI = {
  async getAll(filters?: {
    status?: string;
    booking_type?: string;
    date_from?: string;
    date_to?: string;
  }) {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.booking_type) {
      query = query.eq('booking_type', filters.booking_type);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(booking: Omit<FlightBooking, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<FlightBooking>) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: FlightBooking['status']) {
    return this.update(id, { status });
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, booking_type, total_amount')
      .eq('booking_type', 'flight');
    
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter((b: any) => b.status === 'pending').length || 0,
      confirmed: data?.filter((b: any) => b.status === 'confirmed').length || 0,
      cancelled: data?.filter((b: any) => b.status === 'cancelled').length || 0,
      totalRevenue: data?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0
    };

    return stats;
  }
};