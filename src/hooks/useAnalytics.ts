import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useSearchStats(period?: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ['search-stats', period],
    queryFn: () => analyticsApi.getSearchStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConversionRate(period?: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ['conversion-rate', period],
    queryFn: () => analyticsApi.getConversionRate(period),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePriceTrends() {
  return useQuery({
    queryKey: ['price-trends'],
    queryFn: () => analyticsApi.getPriceTrends(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFavoritesAnalysis() {
  return useQuery({
    queryKey: ['favorites-analysis'],
    queryFn: () => analyticsApi.getFavoritesAnalysis(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTrendPredictions() {
  return useQuery({
    queryKey: ['trend-predictions'],
    queryFn: () => analyticsApi.getTrendPredictions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}