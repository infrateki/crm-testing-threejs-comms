import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, BASE_URL } from './client';
import type { Opportunity, OpportunityStatus, Tier } from '@/types/opportunity';

export interface OpportunityFilters {
  status?: OpportunityStatus[];
  tier?: Tier[];
  owner?: string[];
  portal?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface OpportunitiesResponse {
  data: Opportunity[];
  total: number;
  page: number;
  limit: number;
}

type UpdateContext = { previous: Opportunity | undefined };

export function useOpportunities(filters?: OpportunityFilters) {
  const params = new URLSearchParams();
  if (filters?.status?.length) params.set('status', filters.status.join(','));
  if (filters?.tier?.length) params.set('tier', filters.tier.join(','));
  if (filters?.owner?.length) params.set('owner', filters.owner.join(','));
  if (filters?.portal?.length) params.set('portal', filters.portal.join(','));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page != null) params.set('page', String(filters.page));
  if (filters?.limit != null) params.set('limit', String(filters.limit));

  const qs = params.toString();
  return useQuery<OpportunitiesResponse>({
    queryKey: ['opportunities', filters],
    queryFn: () =>
      apiFetch<OpportunitiesResponse>(`/api/opportunities${qs ? `?${qs}` : ''}`),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useOpportunity(id: string) {
  return useQuery<Opportunity>({
    queryKey: ['opportunity', id],
    queryFn: () => apiFetch<Opportunity>(`/api/opportunities/${id}`),
    staleTime: 60_000,
    enabled: Boolean(id),
    refetchOnWindowFocus: true,
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation<
    Opportunity,
    Error,
    { id: string; updates: Partial<Opportunity> },
    UpdateContext
  >({
    mutationFn: ({ id, updates }) =>
      apiFetch<Opportunity>(`/api/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['opportunity', id] });
      const previous = queryClient.getQueryData<Opportunity>(['opportunity', id]);

      if (previous) {
        queryClient.setQueryData<Opportunity>(['opportunity', id], {
          ...previous,
          ...updates,
        });
      }

      queryClient.setQueriesData<OpportunitiesResponse>(
        { queryKey: ['opportunities'], exact: false },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((o) => (o.id === id ? { ...o, ...updates } : o)),
          };
        },
      );

      return { previous };
    },

    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Opportunity>(['opportunity', id], context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },

    onSettled: (_data, _err, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
      void queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { opportunityId: string; file: File }>({
    mutationFn: async ({ opportunityId, file }) => {
      const body = new FormData();
      body.append('photo', file);
      const res = await fetch(
        `${BASE_URL}/api/opportunities/${opportunityId}/photos`,
        { method: 'POST', body },
      );
      if (!res.ok) {
        throw new Error(await res.text().catch(() => res.statusText));
      }
      return res.json() as Promise<unknown>;
    },

    onSettled: (_data, _err, { opportunityId }) => {
      void queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
    },
  });
}
