import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchGroups,
  fetchGroupDetails,
  createGroup,
  updateGroup,
  deleteGroup,
} from '@/app/actions/db-actions';
import { GroupExpense } from '@/types';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

// =====================
// Query Keys
// =====================

export const groupQueries = {
  all: () => ['groups'] as const,
  byOrg: (orgId: string) => [...groupQueries.all(), 'org', orgId] as const,
  list: (orgId: string) =>
    [...groupQueries.byOrg(orgId), 'list'] as const,
  detail: (groupId: string) =>
    [...groupQueries.all(), 'detail', groupId] as const,
};

// =====================
// Queries
// =====================

export const useGroups = (orgId: string) => {
  return useQuery({
    queryKey: groupQueries.list(orgId),
    queryFn: () => fetchGroups(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGroupDetails = (groupId: string) => {
  return useQuery({
    queryKey: groupQueries.detail(groupId),
    queryFn: () => fetchGroupDetails(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// =====================
// Mutations
// =====================

export const useCreateGroup = () => {
  return useMutation({
    mutationFn: (data: Omit<GroupExpense, 'id'>) =>
      createGroup(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: groupQueries.list(variables.organizationId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.organizationId],
        });

        toast.success('Group Created', {
          description: `Created group ${variables.title}`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
    },
  });
};

export const useUpdateGroup = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
      orgId,
    }: {
      id: string;
      data: Partial<GroupExpense>;
      orgId: string;
    }) => updateGroup(id, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: groupQueries.list(variables.orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.orgId],
        });

        queryClient.invalidateQueries({
          queryKey: groupQueries.detail(variables.id),
        });

        toast.success('Group Updated');
      }
    },
    onError: (error) => {
      console.error('Failed to update group:', error);
      toast.error('Failed to update group');
    },
  });
};

export const useDeleteGroup = () => {
  return useMutation({
    mutationFn: ({
      id,
      orgId,
    }: {
      id: string;
      orgId: string;
    }) => deleteGroup(id, orgId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: groupQueries.list(variables.orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.orgId],
        });

        queryClient.removeQueries({
          queryKey: groupQueries.detail(variables.id),
        });

        toast.success('Group Deleted');
      }
    },
    onError: (error) => {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group');
    },
  });
};