import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { toast } from 'react-hot-toast';

export function useBookings(page = 1, limit = 20, filters?: any) {
  return useQuery({
    queryKey: ['bookings', page, limit, filters],
    queryFn: () => bookingsApi.getAll(page, limit, filters),
    staleTime: 30000, // 30 secondes
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: () => bookingsApi.getStats(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => 
      bookingsApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
      toast.success('Statut mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      bookingsApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      toast.success('Réservation mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}