import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification } from '../api/notifications';
import toast from 'react-hot-toast';

export function useRealtimeNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification, incrementUnreadCount } = useNotificationStore();

  useEffect(() => {
    // S'abonner aux nouvelles notifications
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Ajouter au store
          addNotification(newNotification);
          incrementUnreadCount();

          // Afficher un toast selon le type
          const toastOptions = {
            duration: 5000,
            position: 'top-right' as const,
          };

          switch (newNotification.type) {
            case 'success':
              toast.success(
                `${newNotification.title}\n${newNotification.message}`,
                toastOptions
              );
              break;
            case 'error':
              toast.error(
                `${newNotification.title}\n${newNotification.message}`,
                toastOptions
              );
              break;
            case 'warning':
              toast(
                `${newNotification.title}\n${newNotification.message}`,
                {
                  ...toastOptions,
                  icon: '⚠️',
                }
              );
              break;
            case 'info':
              toast(
                `${newNotification.title}\n${newNotification.message}`,
                {
                  ...toastOptions,
                  icon: 'ℹ️',
                }
              );
              break;
            case 'action_required':
              toast(
                `${newNotification.title}\n${newNotification.message}${newNotification.action_url ? '\n' + (newNotification.action_label || 'Voir détails') : ''}`,
                {
                  ...toastOptions,
                  duration: 8000,
                  icon: '🔔',
                }
              );
              break;
          }

          // Jouer un son de notification
          playNotificationSound();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Nettoyer à la désinscription
    return () => {
      channel.unsubscribe();
    };
  }, [addNotification, incrementUnreadCount]);

  return { isConnected };
}

// Fonction pour jouer un son de notification
function playNotificationSound() {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignorer les erreurs (autoplay peut être bloqué)
    });
  } catch (error) {
    // Pas de son disponible
  }
}