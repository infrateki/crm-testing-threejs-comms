import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './client';
import type { Portal } from '@/types/portal';

export function usePortals() {
  return useQuery<Portal[]>({
    queryKey: ['portals'],
    queryFn: () => apiFetch<Portal[]>('/api/portals'),
    staleTime: 60_000,
    retry: 1,
    retryDelay: 3_000,
    refetchOnWindowFocus: true,
  });
}
