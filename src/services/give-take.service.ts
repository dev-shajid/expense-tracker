import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchGiveTakes,
  createGiveTake,
  updateGiveTake,
} from '@/app/actions/db-actions';
import { GiveTakeRecord } from '@/types';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

// =====================
// Query Keys
// =====================

export const giveTakeQueries = {
  all: () => ['giveTakes'] as const,
  byOrg: (orgId: string) => [...giveTakeQueries.all(), 'org', orgId] as const,
  list: (orgId: string) =>
    [...giveTakeQueries.byOrg(orgId), 'list'] as const,
  detail: (id: string) =>
    [...giveTakeQueries.all(), 'detail', id] as const,
};

// =====================
// Queries
// =====================

export const useGiveTakes = (orgId: string) => {
  return useQuery({
    queryKey: giveTakeQueries.list(orgId),
    queryFn: () => fetchGiveTakes(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// =====================
// Mutations
// =====================

export const useCreateGiveTake = () => {
  return useMutation({
    mutationFn: (data: Omit<GiveTakeRecord, 'id'>) =>
      createGiveTake(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        const orgId = variables.organizationId;

        queryClient.invalidateQueries({
          queryKey: giveTakeQueries.list(orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', orgId],
        });

        const typeLabel = variables.type === 'give' ? 'Given' : 'Taken';
        toast.success(`Amount ${typeLabel}`, {
          description: `${typeLabel} ${variables.amount} to ${variables.personName}`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create give/take record:', error);
      toast.error('Failed to record transaction');
    },
  });
};

export const useUpdateGiveTake = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
      orgId,
    }: {
      id: string;
      data: Partial<GiveTakeRecord>;
      orgId: string;
    }) => updateGiveTake(id, data, orgId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: giveTakeQueries.list(variables.orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.orgId],
        });

        queryClient.invalidateQueries({
          queryKey: giveTakeQueries.detail(variables.id),
        });

        toast.success('Transaction Updated');
      }
    },
    onError: (error) => {
      console.error('Failed to update give/take record:', error);
      toast.error('Failed to update transaction');
    },
  });
};