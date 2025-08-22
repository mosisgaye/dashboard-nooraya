import { Button } from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { 
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { toast } from 'react-hot-toast';

interface BookingStatusUpdateProps {
  booking: any;
}

export function BookingStatusUpdate({ booking }: BookingStatusUpdateProps) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bookingsApi.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const canUpdateStatus = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Changement de statut */}
        {canUpdateStatus && (
          <>
            {booking.status === 'pending' && (
              <DropdownMenuItem
                onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer la réservation
              </DropdownMenuItem>
            )}
            
            {booking.status === 'confirmed' && (
              <DropdownMenuItem
                onClick={() => updateStatus.mutate({ id: booking.id, status: 'completed' })}
                className="text-blue-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme complétée
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem
              onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled' })}
              className="text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Annuler la réservation
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Actions de communication */}
        <DropdownMenuItem>
          <Mail className="mr-2 h-4 w-4" />
          Envoyer un email
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Phone className="mr-2 h-4 w-4" />
          Appeler le client
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Générer la facture
        </DropdownMenuItem>
        
        {/* Gestion des paiements */}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          Voir les paiements
        </DropdownMenuItem>
        
        {booking.status === 'pending' && (
          <DropdownMenuItem>
            <RefreshCw className="mr-2 h-4 w-4" />
            Relancer le paiement
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}