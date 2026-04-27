import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';

export interface KPIData {
  total_opportunities: number;
  total_value: number;
  active_pursuits: number;
  deadlines_this_month: number;
  win_rate: number;
  avg_days_to_close: number;
  by_status: Record<string, number>;
  by_owner: Record<string, number>;
}

export interface DeadlineItem {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  days_until: number;
  status: string;
  tier: number;
  value: number | null;
}

export interface AlertItem {
  type: 'deadline' | 'portal_error';
  id: string;
  title: string;
  deadline: string | null;
}

export function useKPI() {
  return useQuery<KPIData>({
    queryKey: ['kpi'],
    queryFn: () => apiFetch<KPIData>('/api/kpi'),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useDeadlines(days = 30) {
  return useQuery<DeadlineItem[]>({
    queryKey: ['deadlines', days],
    queryFn: () => apiFetch<DeadlineItem[]>(`/api/deadlines?days=${days}`),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAlerts() {
  return useQuery<AlertItem[]>({
    queryKey: ['alerts'],
    queryFn: () => apiFetch<AlertItem[]>('/api/alerts'),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
