import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type CommissionSetting = Database['public']['Tables']['commission_settings']['Row'];

export const commissionsApi = {
  // Récupérer tous les paramètres de commission
  async getSettings() {
    const { data, error } = await supabase
      .from('commission_settings')
      .select('*')
      .order('service_type', { ascending: true })
      .order('valid_from', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer les paramètres actifs par type de service
  async getActiveSettings() {
    const { data, error } = await supabase
      .from('commission_settings')
      .select('*')
      .eq('is_active', true)
      .order('service_type', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Créer un nouveau paramètre de commission
  async createSetting(setting: Omit<CommissionSetting, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('commission_settings')
      .insert(setting)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un paramètre
  async updateSetting(id: string, updates: Partial<CommissionSetting>) {
    const { data, error } = await supabase
      .from('commission_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Désactiver un paramètre
  async deactivateSetting(id: string) {
    return this.updateSetting(id, { is_active: false });
  },

  // Récupérer l'historique des commissions
  async getHistory(filters?: {
    startDate?: string;
    endDate?: string;
    service_type?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('commission_history')
      .select(`
        *,
        booking:bookings(
          id,
          booking_type,
          guest_email,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Statistiques des commissions
  async getStats(period?: { startDate: string; endDate: string }) {
    // Commissions totales
    let totalQuery = supabase
      .from('commission_history')
      .select('commission_amount, service_type');

    if (period) {
      totalQuery = totalQuery
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);
    }

    const { data: commissions, error } = await totalQuery;
    if (error) throw error;

    // Calculer les statistiques
    const stats = {
      total: 0,
      byType: {
        flight: 0,
        hotel: 0,
        package: 0
      },
      count: {
        flight: 0,
        hotel: 0,
        package: 0
      }
    };

    commissions?.forEach(commission => {
      stats.total += commission.commission_amount;
      if (commission.service_type in stats.byType) {
        stats.byType[commission.service_type as keyof typeof stats.byType] += commission.commission_amount;
        stats.count[commission.service_type as keyof typeof stats.count] += 1;
      }
    });

    return stats;
  },

  // Récupérer les commissions par mois
  async getMonthlyRevenue(year: number) {
    const { data, error } = await supabase
      .from('commission_history')
      .select('commission_amount, created_at, service_type')
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31`);

    if (error) throw error;

    // Grouper par mois
    const monthlyData = Array(12).fill(null).map((_, index) => ({
      month: index + 1,
      flight: 0,
      hotel: 0,
      package: 0,
      total: 0
    }));

    data?.forEach(commission => {
      const month = new Date(commission.created_at).getMonth();
      monthlyData[month][commission.service_type as keyof typeof monthlyData[0]] += commission.commission_amount;
      monthlyData[month].total += commission.commission_amount;
    });

    return monthlyData;
  }
};