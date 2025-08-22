import { create } from 'zustand';
import type { Notification } from '../api/notifications';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  setLoading: (loading: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [notification, ...state.notifications]
    })),

  updateNotification: (id, updates) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      )
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  
  incrementUnreadCount: () => 
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  setLoading: (loading) => set({ isLoading: loading }),

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.is_read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      }
      return state;
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0
    }))
}));