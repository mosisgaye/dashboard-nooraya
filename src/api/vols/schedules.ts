import { supabase } from '../../lib/supabase';

export interface FlightSchedule {
  id: string;
  airline_code: string;
  airline_name: string;
  flight_number: string;
  aircraft_type?: string;
  origin_code: string;
  origin_city: string;
  origin_airport: string; // NOT NULL en DB
  origin_country?: string;
  origin_terminal?: string;
  destination_code: string;
  destination_city: string;
  destination_airport: string; // NOT NULL en DB
  destination_country?: string;
  destination_terminal?: string;
  departure_time: string;
  arrival_time: string;
  arrival_day_offset?: number;
  duration_minutes: number; // NOT NULL en DB
  duration_text: string; // NOT NULL en DB
  operates_monday: boolean;
  operates_tuesday: boolean;
  operates_wednesday: boolean;
  operates_thursday: boolean;
  operates_friday: boolean;
  operates_saturday: boolean;
  operates_sunday: boolean;
  valid_from: string;
  valid_until: string;
  stops: number;
  stop_cities?: any[];
  base_price_economy: number;
  base_price_business?: number;
  base_price_first?: number;
  high_season_multiplier?: number;
  low_season_multiplier?: number;
  commission_rate: number;
  currency?: string;
  baggage_cabin?: string;
  baggage_checked_economy?: string;
  baggage_checked_business?: string;
  baggage_checked_first?: string;
  meal_included?: boolean;
  wifi_available?: boolean;
  entertainment_available?: boolean;
  power_outlets?: boolean;
  total_seats_economy?: number;
  total_seats_business?: number;
  total_seats_first?: number;
  is_active: boolean;
  priority_rank?: number;
  created_at?: string;
  updated_at?: string;
}

export const schedulesAPI = {
  async getAll(filters?: {
    origin?: string;
    destination?: string;
    active?: boolean;
  }) {
    let query = supabase
      .from('flight_schedules')
      .select('*')
      .order('priority_rank', { ascending: true });

    if (filters?.origin) {
      query = query.eq('origin_code', filters.origin);
    }
    if (filters?.destination) {
      query = query.eq('destination_code', filters.destination);
    }
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('flight_schedules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(schedule: Omit<FlightSchedule, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('flight_schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<FlightSchedule>) {
    const { data, error } = await supabase
      .from('flight_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('flight_schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { is_active: isActive });
  }
};