import { useState } from 'react';
import { 
  useNotifications, 
  useNotificationStats,
  useMarkMultipleAsRead,
  useArchiveMultiple,
  useDeleteNotification,
  useRealtimeNotifications
} from '../hooks/useNotifications';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DatePicker } from '../components/ui/DatePicker';
import { 
  Bell, 
  Check,
  Archive,
  Trash2,
  Filter,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';

const typeIcons = {
  info: Info,
  warning: AlertCircle,
  error: XCircle,
  success: CheckCircle,
  action_required: Zap
};

const typeStyles = {
  info: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  error: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  success: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  action_required: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
};

const categoryLabels = {
  booking: 'Réservations',
  payment: 'Paiements',
  customer: 'Clients',
  system: 'Système',
  commission: 'Commissions',
  alert: 'Alertes'
};

export default function Notifications() {
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    priority: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Activer les notifications en temps réel
  useRealtimeNotifications();

  const { data: notifications, isLoading } = useNotifications(filters);
  const { data: stats } = useNotificationStats();
  const markMultipleAsRead = useMarkMultipleAsRead();
  const archiveMultiple = useArchiveMultiple();
  const deleteNotification = useDeleteNotification();

  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const actionRequiredNotifications = notifications?.filter(n => n.type === 'action_required') || [];

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications?.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications?.map(n => n.id) || []);
    }
  };

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markMultipleAsRead.mutateAsync(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedNotifications.length > 0) {
      await archiveMultiple.mutateAsync(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleExport = () => {
    // TODO: Implémenter l'export des notifications
    console.log('Export notifications');
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Centre de Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gérez toutes vos notifications et alertes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.total || 0}
                </p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Non lues</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.unread || 0}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Actions requises</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.byType.action_required || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Urgentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.byPriority.urgent || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous</option>
                  <option value="info">Information</option>
                  <option value="warning">Avertissement</option>
                  <option value="error">Erreur</option>
                  <option value="success">Succès</option>
                  <option value="action_required">Action requise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Toutes</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Toutes</option>
                  <option value="low">Faible</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date début
                </label>
                <DatePicker
                  date={filters.startDate ? new Date(filters.startDate) : undefined}
                  onDateChange={(date) => setFilters({ 
                    ...filters, 
                    startDate: date ? format(date, 'yyyy-MM-dd') : '' 
                  })}
                  placeholder="Sélectionner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date fin
                </label>
                <DatePicker
                  date={filters.endDate ? new Date(filters.endDate) : undefined}
                  onDateChange={(date) => setFilters({ 
                    ...filters, 
                    endDate: date ? format(date, 'yyyy-MM-dd') : '' 
                  })}
                  placeholder="Sélectionner"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions bar */}
      {selectedNotifications.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedNotifications.length} notification(s) sélectionnée(s)
          </span>
          <div className="flex gap-2">
            <Button onClick={handleMarkSelectedAsRead} size="sm">
              <Check className="h-4 w-4 mr-1" />
              Marquer comme lu
            </Button>
            <Button onClick={handleArchiveSelected} size="sm" variant="outline">
              <Archive className="h-4 w-4 mr-1" />
              Archiver
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            {stats && stats.total > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Non lues
            {stats && stats.unread > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="action_required">
            Actions requises
            {stats && stats.byType.action_required > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.byType.action_required}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All notifications */}
        <TabsContent value="all">
          <NotificationsList
            notifications={notifications}
            isLoading={isLoading}
            selectedNotifications={selectedNotifications}
            onSelectAll={handleSelectAll}
            onSelectNotification={handleSelectNotification}
            onDelete={deleteNotification.mutateAsync}
          />
        </TabsContent>

        {/* Unread notifications */}
        <TabsContent value="unread">
          <NotificationsList
            notifications={unreadNotifications}
            isLoading={isLoading}
            selectedNotifications={selectedNotifications}
            onSelectAll={handleSelectAll}
            onSelectNotification={handleSelectNotification}
            onDelete={deleteNotification.mutateAsync}
          />
        </TabsContent>

        {/* Action required notifications */}
        <TabsContent value="action_required">
          <NotificationsList
            notifications={actionRequiredNotifications}
            isLoading={isLoading}
            selectedNotifications={selectedNotifications}
            onSelectAll={handleSelectAll}
            onSelectNotification={handleSelectNotification}
            onDelete={deleteNotification.mutateAsync}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant pour la liste des notifications
function NotificationsList({ 
  notifications, 
  isLoading, 
  selectedNotifications,
  onSelectAll,
  onSelectNotification,
  onDelete
}: any) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune notification trouvée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={onSelectAll}
                    className="flex items-center"
                  >
                    {selectedNotifications.length === notifications.length ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification: any) => {
                const Icon = typeIcons[notification.type as keyof typeof typeIcons];
                return (
                  <tr 
                    key={notification.id}
                    className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      !notification.is_read && "bg-blue-50/30 dark:bg-blue-900/10"
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onSelectNotification(notification.id)}
                        className="flex items-center"
                      >
                        {selectedNotifications.includes(notification.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        typeStyles[notification.type as keyof typeof typeStyles]
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        {notification.action_url && (
                          <Link
                            to={notification.action_url}
                            className="inline-flex items-center text-xs text-primary hover:underline mt-1"
                          >
                            {notification.action_label || 'Voir plus'}
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {categoryLabels[notification.category as keyof typeof categoryLabels]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          notification.priority === 'urgent' ? 'destructive' :
                          notification.priority === 'high' ? 'warning' :
                          'secondary'
                        }
                      >
                        {notification.priority === 'urgent' ? 'Urgent' :
                         notification.priority === 'high' ? 'Haute' :
                         notification.priority === 'low' ? 'Faible' : 'Normale'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </div>
                      <div className="text-xs">
                        {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}