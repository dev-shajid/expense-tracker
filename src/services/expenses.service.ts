import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpensesForGroup,
} from '@/app/actions/db-actions';
import { Expense } from '@/types';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

// =====================
// Query Keys
// =====================

export const expenseQueries = {
  all: () => ['expenses'] as const,
  byOrg: (orgId: string) => [...expenseQueries.all(), 'org', orgId] as const,
  list: (orgId: string) =>
    [...expenseQueries.byOrg(orgId), 'list'] as const,
  detail: (id: string) => [...expenseQueries.all(), 'detail', id] as const,
  byGroup: (groupId: string) =>
    [...expenseQueries.all(), 'group', groupId] as const,
  groupList: (groupId: string) =>
    [...expenseQueries.byGroup(groupId), 'list'] as const,
};

// =====================
// Queries
// =====================

export const useExpenses = (orgId: string) => {
  return useQuery({
    queryKey: expenseQueries.list(orgId),
    queryFn: () => fetchExpenses(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExpensesForGroup = (groupId: string) => {
  return useQuery({
    queryKey: expenseQueries.groupList(groupId),
    queryFn: () => fetchExpensesForGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// =====================
// Mutations
// =====================

export const useCreateExpense = () => {
  return useMutation({
    mutationFn: (data: Omit<Expense, 'id'>) =>
      createExpense(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        const orgId = variables.organizationId;
        const groupId = variables.groupId;

        // Invalidate both org and group expenses
        queryClient.invalidateQueries({
          queryKey: expenseQueries.list(orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', orgId],
        });

        if (groupId) {
          queryClient.invalidateQueries({
            queryKey: expenseQueries.groupList(groupId),
          });
        }

        toast.success('Transaction Created', {
          description: `Added ${variables.type} of ${variables.amount} for ${variables.category}`,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create expense:', error);
      toast.error('Failed to create transaction');
    },
  });
};

export const useUpdateExpense = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
      orgId,
      oldGroupId,
    }: {
      id: string;
      data: Partial<Expense>;
      orgId: string;
      oldGroupId?: string;
    }) => updateExpense(id, data, orgId, oldGroupId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: expenseQueries.list(variables.orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.orgId],
        });

        if (variables.oldGroupId) {
          queryClient.invalidateQueries({
            queryKey: expenseQueries.groupList(variables.oldGroupId),
          });
        }

        toast.success('Transaction Updated');
      }
    },
    onError: (error) => {
      console.error('Failed to update expense:', error);
      toast.error('Failed to update transaction');
    },
  });
};

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: ({
      id,
      orgId,
      groupId,
    }: {
      id: string;
      orgId: string;
      groupId?: string;
    }) => deleteExpense(id, orgId, groupId),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: expenseQueries.list(variables.orgId),
        });

        // Invalidate stats query
        queryClient.invalidateQueries({
          queryKey: ['stats', 'org', variables.orgId],
        });

        if (variables.groupId) {
          queryClient.invalidateQueries({
            queryKey: expenseQueries.groupList(variables.groupId),
          });
        }

        toast.success('Transaction Deleted');
      }
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete transaction');
    },
  });
};