import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  Calendar,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/format';
import type { ColumnDef } from '@tanstack/react-table';
import type { Booking } from '../types/booking';
import type { Payment } from '../types/payment';

export default function CustomerDetail() {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', email],
    queryFn: () => customersApi.getByEmail(email!),
    enabled: !!email,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', email],
    queryFn: () => bookingsApi.getByCustomer(email!),
    enabled: !!email,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['customer-payments', email],
    queryFn: async () => {
      if (!bookings) return [];
      const paymentPromises = bookings.map(booking => 
        paymentsApi.getByBooking(booking.id)
      );
      const results = await Promise.all(paymentPromises);
      return results.flat();
    },
    enabled: !!bookings && bookings.length > 0,
  });

  const bookingColumns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as string;
        return <span className="font-mono text-xs">{id.slice(0, 8)}</span>;
      },
    },
    {
      accessorKey: 'booking_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('booking_type') as string;
        const typeConfig = {
          flight: { label: 'Vol', color: 'blue' },
          hotel: { label: 'Hôtel', color: 'green' },
          package: { label: 'Forfait', color: 'purple' },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Badge color={config.color}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          pending: { label: 'En attente', icon: Clock, color: 'yellow' },
          confirmed: { label: 'Confirmé', icon: CheckCircle, color: 'green' },
          cancelled: { label: 'Annulé', icon: XCircle, color: 'red' },
          completed: { label: 'Terminé', icon: CheckCircle, color: 'blue' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config.icon;
        return (
          <Badge color={config.color} className="flex items-center gap-1">
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Montant',
      cell: ({ row }) => formatCurrency(row.getValue('total_amount')),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('created_at')),
    },
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as string;
        return <span className="font-mono text-xs">{id.slice(0, 8)}</span>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => formatCurrency(row.getValue('amount')),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusConfig = {
          pending: { label: 'En attente', color: 'yellow' },
          success: { label: 'Réussi', color: 'green' },
          failed: { label: 'Échoué', color: 'red' },
          cancelled: { label: 'Annulé', color: 'gray' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge color={config.color}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: 'payment_method',
      header: 'Méthode',
      cell: ({ row }) => row.getValue('payment_method') || '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue('created_at')),
    },
  ];

  if (customerLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!customer) {
    return <div className="p-8">Client non trouvé</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/customers')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux clients
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations client */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Informations client</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                <p className="font-medium">{customer?.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{customer?.customer_email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">{customer?.customer_phone}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {customer?.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  )) || <span className="text-gray-400">Aucun tag</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                <p className="mt-1 text-sm">
                  {customer?.notes || <span className="text-gray-400">Aucune note</span>}
                </p>
              </div>
            </div>
          </Card>

          {/* Statistiques */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Réservations</span>
                </div>
                <span className="font-semibold">{customer?.booking_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total dépensé</span>
                </div>
                <span className="font-semibold">{formatCurrency(customer?.total_spent || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dernière réservation</span>
                </div>
                <span className="font-semibold">
                  {customer?.last_booking_date ? formatDate(customer.last_booking_date) : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Réservations et paiements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Réservations */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Historique des réservations</h2>
            <DataTable
              columns={bookingColumns}
              data={bookings || []}
              loading={bookingsLoading}
            />
          </Card>

          {/* Paiements */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Historique des paiements</h2>
            <DataTable
              columns={paymentColumns}
              data={payments || []}
              loading={paymentsLoading}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}