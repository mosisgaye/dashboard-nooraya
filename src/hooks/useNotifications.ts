import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import type { NotificationFilters } from '../api/notifications';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useNotificationById(id: string) {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationsApi.getNotificationById(id),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications-stats'],
    queryFn: () => notificationsApi.getNotificationStats(),
    staleTime: 60 * 1000,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Notification créée');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la notification');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
    },
  });
}

export function useMarkMultipleAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markMultipleAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Notifications marquées comme lues');
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Toutes les notifications ont été marquées comme lues');
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.archiveNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Notification archivée');
    },
  });
}

export function useArchiveMultiple() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.archiveMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Notifications archivées');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });
      toast.success('Notification supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
}

// Hook pour les notifications en temps réel
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = notificationsApi.subscribeToNotifications((notification) => {
      // Invalider les queries pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-stats'] });

      // Afficher une toast pour les notifications importantes
      if (notification.priority === 'urgent' || notification.priority === 'high') {
        const toastType = notification.type === 'error' ? 'error' : 
                         notification.type === 'warning' ? 'error' :
                         notification.type === 'success' ? 'success' : 'loading';
        
        toast[toastType](notification.message, {
          duration: 6000,
          icon: notification.type === 'action_required' ? '⚡' : undefined,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}