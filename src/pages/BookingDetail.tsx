import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { paymentsApi } from '../api/payments';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  FileText,
  Send,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plane,
  Building,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import { generateInvoicePDF } from '../utils/invoice';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import EmailComposer from '../components/email/EmailComposer';

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['booking-payments', id],
    queryFn: () => paymentsApi.getByBooking(id!),
    enabled: !!id
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => bookingsApi.updateStatus(id!, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Statut mis à jour');
    }
  });

  if (bookingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8">
        <p>Réservation non trouvée</p>
        <Button onClick={() => navigate('/bookings')} className="mt-4">
          Retour aux réservations
        </Button>
      </div>
    );
  }

  const typeIcons = {
    flight: Plane,
    hotel: Building,
    package: Package
  };

  // Fonction pour obtenir le label et l'icône du type
  const getTypeInfo = () => {
    if (booking.booking_type !== 'package') {
      const labels = {
        flight: 'Vol',
        hotel: 'Hôtel'
      };
      return { 
        icon: typeIcons[booking.booking_type as keyof typeof typeIcons], 
        label: labels[booking.booking_type as keyof typeof labels] || booking.booking_type 
      };
    }
    
    // Détection du sous-type de package
    const packageType = booking.passenger_details?.packageType;
    if (packageType) {
      const subtypes: Record<string, string> = {
        umra: 'Umra',
        can2025: 'CAN 2025',
        visa: 'Visa',
        sejour: 'Séjour'
      };
      return { icon: Package, label: subtypes[packageType] || 'Package' };
    }
    
    // Détection par destination
    if (booking.flight_details?.destination) {
      const destination = booking.flight_details.destination.toLowerCase();
      if (destination.includes('mecca') || destination.includes('mecque') || 
          destination.includes('saudi') || destination.includes('arabie')) {
        return { icon: Package, label: 'Umra' };
      }
      if (destination.includes('abidjan') || destination.includes('côte d\'ivoire')) {
        return { icon: Package, label: 'CAN 2025' };
      }
    }
    
    // Détection par prix par personne
    const passengers = booking.passenger_details?.passengers || [];
    const numberOfPassengers = passengers.length || 1;
    const pricePerPerson = booking.total_amount / numberOfPassengers;
    
    if (pricePerPerson >= 1100000 && pricePerPerson <= 1800000) {
      return { icon: Package, label: 'Umra' };
    } else if (pricePerPerson >= 800000 && pricePerPerson <= 1200000) {
      return { icon: Package, label: 'CAN 2025' };
    } else if (pricePerPerson >= 50000 && pricePerPerson <= 300000) {
      return { icon: Package, label: 'Visa' };
    }
    
    return { icon: Package, label: 'Package' };
  };

  const { icon: TypeIcon, label: typeLabel } = getTypeInfo();

  const statusConfig = {
    pending: { label: 'En attente', color: 'warning', icon: Clock },
    confirmed: { label: 'Confirmée', color: 'success', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'destructive', icon: XCircle },
    failed: { label: 'Échouée', color: 'destructive', icon: AlertCircle },
    completed: { label: 'Complétée', color: 'secondary', icon: CheckCircle }
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookings')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux réservations
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <TypeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Réservation #{booking.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {typeLabel} - Créée le {format(new Date(booking.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
          
          <Badge variant={status.color as any} className="text-lg px-4 py-2">
            <status.icon className="w-5 h-5 mr-2" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button
          onClick={() => generateInvoicePDF(booking)}
          variant="outline"
          className="justify-start"
        >
          <FileText className="mr-2 h-4 w-4" />
          Générer la facture
        </Button>
        
        <Button variant="outline" className="justify-start">
          <Send className="mr-2 h-4 w-4" />
          Envoyer par email
        </Button>
        
        <Button variant="outline" className="justify-start">
          <Download className="mr-2 h-4 w-4" />
          Télécharger les documents
        </Button>
        
        <Button variant="outline" className="justify-start">
          <Edit className="mr-2 h-4 w-4" />
          Modifier la réservation
        </Button>
        
        <Button 
          variant="outline" 
          className="justify-start"
          onClick={() => setShowEmailComposer(true)}
        >
          <Send className="mr-2 h-4 w-4" />
          Envoyer un email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de la réservation */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
              
              {booking.booking_type === 'flight' && booking.flight_details && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{booking.flight_details.departure || 'Non spécifié'}</p>
                        <p className="text-sm text-gray-500">Départ</p>
                      </div>
                    </div>
                    <Plane className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{booking.flight_details.arrival || 'Non spécifié'}</p>
                        <p className="text-sm text-gray-500">Arrivée</p>
                      </div>
                      <MapPin className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  
                  {booking.flight_details.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>Date du vol: {booking.flight_details.date}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Passagers */}
              {booking.passenger_details?.passengers && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Passagers</h3>
                  <div className="space-y-2">
                    {booking.passenger_details.passengers.map((passenger: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{passenger.name || `Passager ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des paiements */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Historique des paiements</h2>
              
              {paymentsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          payment.status === 'success' ? 'success' :
                          payment.status === 'pending' ? 'warning' :
                          'destructive'
                        }>
                          {payment.status === 'success' ? 'Réussi' :
                           payment.status === 'pending' ? 'En attente' :
                           'Échoué'}
                        </Badge>
                      </div>
                      {payment.payment_method && (
                        <p className="text-sm text-gray-500 mt-2">
                          Méthode: {payment.payment_method}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun paiement enregistré</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline des événements */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Historique</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Réservation créée</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                {booking.updated_at !== booking.created_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Dernière modification</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Informations client */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informations client</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                  <p className="font-medium">
                    {booking.passenger_details?.passengers?.[0]?.name || 
                     booking.guest_email?.split('@')[0] || 'Client'}
                  </p>
                </div>
                
                {booking.guest_email && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="font-medium">{booking.guest_email}</p>
                    </div>
                  </div>
                )}
                
                {booking.guest_phone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="font-medium">{booking.guest_phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowEmailComposer(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer un email
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Appeler le client
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Résumé financier */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Résumé financier</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant total</span>
                  <span className="font-semibold">{formatCurrency(booking.total_amount)}</span>
                </div>
                
                {booking.commission_amount && booking.commission_amount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Commission</span>
                      <span>{formatCurrency(booking.commission_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taux</span>
                      <span>{booking.commission_percentage}%</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montant net</span>
                      <span className="font-semibold">
                        {formatCurrency(booking.total_amount - booking.commission_amount)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions sur le statut */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Actions</h2>
                <div className="space-y-2">
                  {booking.status === 'pending' && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => updateStatus.mutate('confirmed')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer la réservation
                    </Button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => updateStatus.mutate('completed')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme complétée
                    </Button>
                  )}
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => updateStatus.mutate('cancelled')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Annuler la réservation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modal Email Composer */}
      {showEmailComposer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto">
            <EmailComposer
              defaultTo={booking.guest_email}
              defaultSubject={`Réservation #${booking.id.slice(0, 8).toUpperCase()}`}
              bookingData={booking}
              onClose={() => setShowEmailComposer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}