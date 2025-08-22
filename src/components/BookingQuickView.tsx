import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Badge } from './ui/Badge';
import { formatDate, formatCurrency } from '../utils/format';
import { 
  Calendar,
  Mail,
  Phone,
  User,
  Plane,
  Building,
  Package,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface BookingQuickViewProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingQuickView({ booking, open, onOpenChange }: BookingQuickViewProps) {
  if (!booking) return null;

  const typeIcons = {
    flight: Plane,
    hotel: Building,
    package: Package
  };

  const TypeIcon = typeIcons[booking.booking_type as keyof typeof typeIcons];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            Réservation #{booking.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et type */}
          <div className="flex items-center justify-between">
            <Badge variant={
              booking.status === 'confirmed' ? 'success' :
              booking.status === 'pending' ? 'warning' :
              booking.status === 'cancelled' ? 'destructive' :
              'secondary'
            }>
              {booking.status === 'pending' && 'En attente'}
              {booking.status === 'confirmed' && 'Confirmée'}
              {booking.status === 'cancelled' && 'Annulée'}
              {booking.status === 'failed' && 'Échouée'}
              {booking.status === 'completed' && 'Complétée'}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatDate(booking.created_at)}
            </span>
          </div>

          {/* Informations client */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations client
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nom</p>
                <p className="font-medium">
                  {booking.passenger_details?.passengers?.[0]?.name || 
                   booking.guest_email?.split('@')[0] || 'Client'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {booking.guest_email || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Téléphone</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {booking.guest_phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Date de réservation</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(booking.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Détails de la réservation */}
          {booking.booking_type === 'flight' && booking.flight_details && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Détails du vol
              </h3>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Départ:</span> {booking.flight_details.departure}</p>
                <p><span className="text-gray-500">Arrivée:</span> {booking.flight_details.arrival}</p>
                <p><span className="text-gray-500">Date:</span> {booking.flight_details.date}</p>
                <p><span className="text-gray-500">Passagers:</span> {booking.passenger_details?.passengers?.length || 1}</p>
              </div>
            </div>
          )}

          {/* Informations financières */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Informations financières
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant total</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(booking.total_amount)}
                </span>
              </div>
              {booking.commission_amount && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Commission ({booking.commission_percentage}%)</span>
                    <span>{formatCurrency(booking.commission_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Montant net</span>
                    <span>{formatCurrency(booking.total_amount - booking.commission_amount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Alertes */}
          {booking.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Réservation en attente
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                    Cette réservation nécessite une confirmation. Le client a été notifié et doit procéder au paiement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}