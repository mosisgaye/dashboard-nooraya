import React from 'react';
import { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { BookingStatusUpdate } from '../components/BookingStatusUpdate';
import { BookingQuickView } from '../components/BookingQuickView';
import { BookingFilters } from '../components/BookingFilters';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plane,
  Building,
  Package,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { exportToCSV, exportToExcel } from '../utils/export';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';

export default function BookingsV2() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    booking_type: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    customer_email: ''
  });
  
  // Gérer les filtres de sous-types de packages
  const processedFilters = React.useMemo(() => {
    const baseFilters: any = { ...filters, search: searchTerm };
    
    // Si le filtre est un sous-type de package (ex: "package:umra")
    if (baseFilters.booking_type?.includes(':')) {
      const [type, subtype] = baseFilters.booking_type.split(':');
      baseFilters.booking_type = type;
      baseFilters.packageSubtype = subtype;
    }
    
    return baseFilters;
  }, [filters, searchTerm]);
  
  const { data: rawData, isLoading, refetch } = useBookings(page, 20, processedFilters);
  
  // Filtrer les résultats côté client pour les sous-types de packages
  const data = React.useMemo(() => {
    if (!rawData || !processedFilters.packageSubtype) return rawData;
    
    const filteredData = rawData.data.filter((booking: any) => {
      if (booking.booking_type !== 'package') return true;
      const subtype = getPackageSubtype(booking);
      return subtype === processedFilters.packageSubtype;
    });
    
    return {
      ...rawData,
      data: filteredData,
      count: filteredData.length
    };
  }, [rawData, processedFilters.packageSubtype]);

  // Fonction pour détecter le sous-type de package
  const getPackageSubtype = (booking: any): string => {
    // 1. Vérifier dans passenger_details (le plus fiable)
    if (booking.passenger_details?.packageType) {
      return booking.passenger_details.packageType;
    }
    
    // 2. Vérifier dans flight_details ou d'autres champs
    if (booking.flight_details?.destination) {
      const destination = booking.flight_details.destination.toLowerCase();
      if (destination.includes('mecca') || destination.includes('mecque') || 
          destination.includes('medina') || destination.includes('médine') ||
          destination.includes('saudi') || destination.includes('arabie')) {
        return 'umra';
      }
      if (destination.includes('abidjan') || destination.includes('côte') || 
          destination.includes('ivoire') || destination.includes('can')) {
        return 'can2025';
      }
    }
    
    // 3. Analyser le nombre de passagers et le prix par personne
    const passengers = booking.passenger_details?.passengers || [];
    const numberOfPassengers = passengers.length || 1;
    const pricePerPerson = booking.total_amount / numberOfPassengers;
    
    // Prix moyens par personne
    if (pricePerPerson >= 1100000 && pricePerPerson <= 1800000) {
      return 'umra'; // Umra coûte généralement 1.1M - 1.8M par personne
    } else if (pricePerPerson >= 800000 && pricePerPerson <= 1200000) {
      return 'can2025'; // CAN coûte généralement 800k - 1.2M par personne
    } else if (pricePerPerson >= 50000 && pricePerPerson <= 300000) {
      return 'visa'; // Visa coûte généralement 50k - 300k par personne
    }
    
    // 4. Si on ne peut pas déterminer, retourner 'general'
    return 'general';
  };

  const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    flight: { label: 'Vol', icon: Plane, color: 'text-blue-600 bg-blue-100' },
    hotel: { label: 'Hôtel', icon: Building, color: 'text-green-600 bg-green-100' },
    package: { label: 'Package', icon: Package, color: 'text-purple-600 bg-purple-100' },
    // Sous-types de packages
    umra: { label: 'Umra', icon: Package, color: 'text-emerald-600 bg-emerald-100' },
    can2025: { label: 'CAN 2025', icon: Package, color: 'text-orange-600 bg-orange-100' },
    visa: { label: 'Visa', icon: Package, color: 'text-indigo-600 bg-indigo-100' },
    general: { label: 'Package', icon: Package, color: 'text-purple-600 bg-purple-100' }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      case 'failed': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'failed': return 'Échouée';
      case 'completed': return 'Complétée';
      default: return status;
    }
  };

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!data?.data) return null;
    
    const totalRevenue = data.data.reduce((sum, b) => sum + b.total_amount, 0);
    const pendingCount = data.data.filter(b => b.status === 'pending').length;
    const pendingAmount = data.data
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + b.total_amount, 0);
    
    return {
      totalRevenue,
      pendingCount,
      pendingAmount,
      averageAmount: totalRevenue / (data.data.length || 1)
    };
  }, [data]);

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!data?.data || data.data.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    try {
      if (format === 'csv') {
        const date = formatDate(new Date(), 'yyyy-MM-dd');
        exportToCSV(data.data, `reservations-${date}.csv`);
        toast.success('Export CSV généré avec succès');
      } else {
        const date = formatDate(new Date(), 'yyyy-MM-dd');
        await exportToExcel(data.data, `reservations-${date}.xlsx`);
        toast.success('Export Excel généré avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Réservations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gérez toutes les réservations clients
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Mini statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total réservations</p>
                    <p className="text-2xl font-bold">{data?.count || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenus totaux</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">En attente</p>
                    <p className="text-2xl font-bold">{stats.pendingCount}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(stats.pendingAmount)}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ticket moyen</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.averageAmount)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <BookingFilters filters={filters} onFiltersChange={setFilters} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des réservations */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Réservation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Statut
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
                  {data?.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        Aucune réservation trouvée
                      </td>
                    </tr>
                  ) : (
                    data?.data.map((booking: any) => {
                      // Déterminer le type ou sous-type
                      const displayType = booking.booking_type === 'package' 
                        ? getPackageSubtype(booking)
                        : booking.booking_type;
                      
                      const config = typeConfig[displayType] || typeConfig[booking.booking_type];
                      const TypeIcon = config.icon;
                      
                      return (
                        <tr 
                          key={booking.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                #{booking.id.slice(0, 8).toUpperCase()}
                              </p>
                              {booking.external_booking_id && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Ref: {booking.external_booking_id}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {booking.passenger_details?.passengers?.[0]?.name || 
                                 booking.guest_email?.split('@')[0] || 'Client'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.guest_email || '-'}
                              </p>
                              {booking.guest_phone && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {booking.guest_phone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={cn('p-2 rounded-lg', config.color)}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {config.label}
                                </span>
                                {booking.booking_type === 'package' && displayType !== 'general' && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {booking.booking_type}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(booking.total_amount)}
                              </p>
                              {booking.commission_amount > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Com: {formatCurrency(booking.commission_amount)}
                                  {booking.commission_percentage && 
                                    ` (${booking.commission_percentage}%)`}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={statusBadgeVariant(booking.status)}>
                              {statusLabel(booking.status)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(new Date(booking.created_at), 'dd MMM yyyy', { locale: fr })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <BookingStatusUpdate booking={booking} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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

      {/* Quick View Modal */}
      <BookingQuickView 
        booking={selectedBooking} 
        open={!!selectedBooking} 
        onOpenChange={(open) => !open && setSelectedBooking(null)} 
      />
    </div>
  );
}