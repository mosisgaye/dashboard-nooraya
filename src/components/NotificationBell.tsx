import { useState } from 'react';
import { Bell, Check, Archive, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useNotifications, useUnreadCount, useMarkAsRead, useArchiveNotification, useMarkAllAsRead } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';

const typeIcons = {
  info: '🔵',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  action_required: '⚡'
};

const typeColors = {
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  action_required: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications({ is_archived: false });
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const archiveNotification = useArchiveNotification();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }
    if (notification.action_url) {
      setIsOpen(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await archiveNotification.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  // Grouper les notifications par date
  const groupedNotifications = notifications?.reduce((acc: any, notification: any) => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group: string;
    if (date.toDateString() === today.toDateString()) {
      group = "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'Hier';
    } else {
      group = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(notification);
    return acc;
  }, {});

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notifications panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucune notification
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(groupedNotifications || {}).map(([date, dateNotifications]: [string, any]) => (
                    <div key={date}>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {date}
                        </p>
                      </div>
                      {dateNotifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                            !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
                              typeColors[notification.type as keyof typeof typeColors]
                            )}>
                              {typeIcons[notification.type as keyof typeof typeIcons]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  {notification.action_url && (
                                    <Link
                                      to={notification.action_url}
                                      className="inline-flex items-center text-xs text-primary hover:underline mt-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {notification.action_label || 'Voir plus'}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Link>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 h-6 w-6"
                                  onClick={(e) => handleArchive(e, notification.id)}
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center mt-2 space-x-3">
                                <Badge
                                  variant={
                                    notification.priority === 'urgent' ? 'destructive' :
                                    notification.priority === 'high' ? 'warning' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {notification.priority === 'urgent' ? 'Urgent' :
                                   notification.priority === 'high' ? 'Important' :
                                   notification.priority === 'low' ? 'Faible' : 'Normal'}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </span>
                                {!notification.is_read && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="text-sm text-primary hover:underline flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}