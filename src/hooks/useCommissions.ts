import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionsApi } from '../api/commissions';
import { toast } from 'react-hot-toast';

export function useCommissionSettings() {
  return useQuery({
    queryKey: ['commission-settings'],
    queryFn: () => commissionsApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActiveCommissionSettings() {
  return useQuery({
    queryKey: ['commission-settings-active'],
    queryFn: () => commissionsApi.getActiveSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommissionHistory(filters?: any) {
  return useQuery({
    queryKey: ['commission-history', filters],
    queryFn: () => commissionsApi.getHistory(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCommissionStats(period?: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ['commission-stats', period],
    queryFn: () => commissionsApi.getStats(period),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyCommissionRevenue(year: number) {
  return useQuery({
    queryKey: ['commission-monthly-revenue', year],
    queryFn: () => commissionsApi.getMonthlyRevenue(year),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCommissionSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (setting: any) => commissionsApi.createSetting(setting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
      queryClient.invalidateQueries({ queryKey: ['commission-settings-active'] });
      toast.success('Paramètre de commission créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });
}

export function useUpdateCommissionSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      commissionsApi.updateSetting(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
      queryClient.invalidateQueries({ queryKey: ['commission-settings-active'] });
      toast.success('Paramètre de commission mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}

export function useDeactivateCommissionSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => commissionsApi.deactivateSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
      queryClient.invalidateQueries({ queryKey: ['commission-settings-active'] });
      toast.success('Paramètre de commission désactivé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la désactivation');
    },
  });
}