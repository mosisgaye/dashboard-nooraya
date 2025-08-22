import { supabase } from '../../lib/supabase';

export interface Flight {
  id: string;
  flight_code: string;
  airline_name: string;
  airline_code: string;
  flight_number: string;
  aircraft_type?: string;
  origin_code: string;
  origin_city: string;
  origin_airport: string; // NOT NULL en DB
  origin_country?: string;
  destination_code: string;
  destination_city: string;
  destination_airport: string; // NOT NULL en DB
  destination_country?: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  duration_minutes: number; // NOT NULL en DB
  duration_text?: string;
  stops: number;
  stop_cities?: any[];
  base_price: number;
  our_price: number;
  currency?: string;
  cabin_class?: string; // Optionnel avec valeur par défaut 'economy'
  baggage_cabin?: string;
  baggage_checked?: string;
  amenities?: any[];
  available_seats?: number; // Optionnel avec valeur par défaut 9
  is_active: boolean;
  available_from?: string;
  available_to?: string;
  data_source?: string;
  external_id?: string;
  raw_data?: any;
  last_synced_at?: string;
  wifi_available?: boolean;
  images?: any[];
  priority_rank?: number;
  created_at?: string;
  updated_at?: string;
}

export const flightsAPI = {
  async getAll(filters?: {
    departure_date?: string;
    origin?: string;
    destination?: string;
    active?: boolean;
  }) {
    let query = supabase
      .from('flights')
      .select('*')
      .order('departure_date', { ascending: true });

    if (filters?.departure_date) {
      query = query.eq('departure_date', filters.departure_date);
    }
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
      .from('flights')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(flight: Omit<Flight, 'id' | 'created_at' | 'updated_at'>) {
    // Nettoyer les champs undefined ou null pour éviter les erreurs Supabase
    const cleanedFlight = Object.entries(flight).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key as keyof typeof flight] = value;
      }
      return acc;
    }, {} as any);
    
    const { data, error } = await supabase
      .from('flights')
      .insert(cleanedFlight)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur création vol:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, updates: Partial<Flight>) {
    const { data, error } = await supabase
      .from('flights')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { is_active: isActive });
  }
};