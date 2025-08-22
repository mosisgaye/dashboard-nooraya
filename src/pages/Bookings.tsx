import { useState } from 'react';
import { useBookings, useUpdateBookingStatus } from '../hooks/useBookings';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plane,
  Building,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';

export default function Bookings() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    booking_type: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const { data, isLoading } = useBookings(page, 20, filters);
  const updateStatus = useUpdateBookingStatus();

  const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "destructive" | "secondary"; icon: any }> = {
    pending: { label: 'En attente', variant: 'warning', icon: Clock },
    confirmed: { label: 'Confirmée', variant: 'success', icon: CheckCircle },
    cancelled: { label: 'Annulée', variant: 'destructive', icon: XCircle },
    failed: { label: 'Échouée', variant: 'destructive', icon: XCircle }
  };

  const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    flight: { label: 'Vol', icon: Plane, color: 'text-blue-600 bg-blue-100' },
    hotel: { label: 'Hôtel', icon: Building, color: 'text-green-600 bg-green-100' },
    package: { label: 'Package', icon: Package, color: 'text-purple-600 bg-purple-100' }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    await updateStatus.mutate({ id: bookingId, status: newStatus });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Réservations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez toutes les réservations clients
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="failed">Échouée</option>
            </select>

            <select
              value={filters.booking_type}
              onChange={(e) => setFilters({ ...filters, booking_type: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Tous les types</option>
              <option value="flight">Vols</option>
              <option value="hotel">Hôtels</option>
              <option value="package">Packages</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Plus de filtres
            </Button>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {data?.data.map((booking: any) => {
                    const StatusIcon = statusConfig[booking.status].icon;
                    const TypeIcon = typeConfig[booking.booking_type].icon;
                    
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{booking.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.passenger_details?.passengers?.[0]?.name || booking.guest_email?.split('@')[0] || 'Client'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {booking.guest_email || '-'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.guest_phone || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={cn('p-2 rounded-lg', typeConfig[booking.booking_type].color)}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {typeConfig[booking.booking_type].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(booking.total_amount)}
                            </p>
                            {booking.commission_amount > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Commission: {formatCurrency(booking.commission_amount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={statusConfig[booking.status].variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[booking.status].label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(booking.created_at), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/bookings/${booking.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {((page - 1) * 20) + 1} à {Math.min(page * 20, data.count)} sur {data.count} résultats
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    className="w-10"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}