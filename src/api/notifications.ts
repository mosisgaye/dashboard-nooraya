import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id?: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'action_required';
  category: 'booking' | 'payment' | 'customer' | 'system' | 'commission' | 'alert';
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  related_entity_id?: string;
  related_entity_type?: 'booking' | 'customer' | 'payment' | 'commission' | 'alert';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  metadata?: any;
  created_at: string;
  read_at?: string;
  archived_at?: string;
  expires_at?: string;
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  priority?: string;
  is_read?: boolean;
  is_archived?: boolean;
  startDate?: string;
  endDate?: string;
}

export const notificationsApi = {
  // Récupérer les notifications
  async getNotifications(filters?: NotificationFilters) {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrer les notifications expirées et archivées par défaut
    if (!filters?.is_archived) {
      query = query.eq('is_archived', false);
    }

    query = query.or('expires_at.is.null,expires_at.gt.now()');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Récupérer une notification par ID
  async getNotificationById(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read' | 'is_archived'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false,
        is_archived: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer comme lu
  async markAsRead(id: string) {
    const { data, error } = await supabase
      .rpc('mark_notification_read', { notification_id: id });

    if (error) throw error;
    return data;
  },

  // Marquer plusieurs comme lues
  async markMultipleAsRead(ids: string[]) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },

  // Marquer toutes comme lues
  async markAllAsRead() {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)
      .eq('is_archived', false)
      .select();

    if (error) throw error;
    return data;
  },

  // Archiver une notification
  async archiveNotification(id: string) {
    const { data, error } = await supabase
      .rpc('archive_notification', { notification_id: id });

    if (error) throw error;
    return data;
  },

  // Archiver plusieurs notifications
  async archiveMultiple(ids: string[]) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },

  // Supprimer une notification
  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Obtenir le nombre de notifications non lues
  async getUnreadCount() {
    const { data, error } = await supabase
      .rpc('get_unread_notification_count');

    if (error) throw error;
    return data || 0;
  },

  // Obtenir les statistiques
  async getNotificationStats() {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('type, category, priority, is_read')
      .eq('is_archived', false);

    if (error) throw error;

    const stats = {
      total: notifications?.length || 0,
      unread: notifications?.filter(n => !n.is_read).length || 0,
      byType: {
        info: 0,
        warning: 0,
        error: 0,
        success: 0,
        action_required: 0
      },
      byCategory: {
        booking: 0,
        payment: 0,
        customer: 0,
        system: 0,
        commission: 0,
        alert: 0
      },
      byPriority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0
      }
    };

    notifications?.forEach(notification => {
      stats.byType[notification.type as keyof typeof stats.byType]++;
      stats.byCategory[notification.category as keyof typeof stats.byCategory]++;
      stats.byPriority[notification.priority as keyof typeof stats.byPriority]++;
    });

    return stats;
  },

  // S'abonner aux notifications en temps réel
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};