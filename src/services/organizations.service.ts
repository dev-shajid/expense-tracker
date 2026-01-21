import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchUserOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  fetchStats,
} from '@/app/actions/db-actions';
import { Organization, Stats } from '@/types';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

// =====================
// Query Keys
// =====================

export const organizationQueries = {
  all: () => ['organizations'] as const,
  byUser: (userId: string) =>
    [...organizationQueries.all(), 'user', userId] as const,
  list: (userId: string) =>
    [...organizationQueries.byUser(userId), 'list'] as const,
  detail: (id: string) =>
    [...organizationQueries.all(), 'detail', id] as const,
};

export const statsQueries = {
  all: () => ['stats'] as const,
  byOrg: (orgId: string) => [...statsQueries.all(), 'org', orgId] as const,
};

// =====================
// Queries
// =====================

export const useUserOrganizations = (userId: string) => {
  return useQuery({
    queryKey: organizationQueries.list(userId),
    queryFn: () => fetchUserOrganizations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// =====================
// Mutations
// =====================

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: (data: Omit<Organization, 'id'>) =>
      createOrganization(data),
    onSuccess: (result, variables) => {
      if (result.success && variables.ownerId) {
        queryClient.invalidateQueries({
          queryKey: organizationQueries.list(variables.ownerId),
        });

        toast.success('Organization Created', {
          description: `${variables.name} has been created`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    },
  });
};

export const useUpdateOrganization = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
      userId,
    }: {
      id: string;
      data: Partial<Organization>;
      userId: string;
    }) => updateOrganization(id, data, userId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: organizationQueries.list(variables.userId),
        });

        queryClient.invalidateQueries({
          queryKey: organizationQueries.detail(variables.id),
        });

        toast.success('Organization Updated');
      } else {
        toast.error(
          result.error || 'Failed to update organization'
        );
      }
    },
    onError: (error) => {
      console.error('Failed to update organization:', error);
      toast.error('Failed to update organization');
    },
  });
};

export const useDeleteOrganization = () => {
  return useMutation({
    mutationFn: ({
      id,
      userId,
    }: {
      id: string;
      userId: string;
    }) => deleteOrganization(id, userId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: organizationQueries.list(variables.userId),
        });

        queryClient.removeQueries({
          queryKey: organizationQueries.detail(variables.id),
        });

        toast.success('Organization Deleted');
      } else {
        toast.error(
          result.error || 'Failed to delete organization'
        );
      }
    },
    onError: (error) => {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization');
    },
  });
};

export const useStats = (orgId: string) => {
  return useQuery({
    queryKey: statsQueries.byOrg(orgId),
    queryFn: () => fetchStats(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 1, // 1 minute - stats change frequently
    placeholderData: {
      currentBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      pendingToGive: 0,
      pendingToTake: 0,
    } as Stats,
  });
};
