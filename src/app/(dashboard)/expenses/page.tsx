"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { ExpensesListSkeleton } from "@/components/skeletons"
import { useExpenses } from "@/services/expenses.service"
import { useGroups } from "@/services/groups.service"
import Loading from "./loading"

export default function ExpensesPage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()

  const { data: expenses, isLoading: expensesLoading, refetch: refetchExpenses } = useExpenses(currentOrg?.id!);
  const { data: groups, isLoading: groupsLoading, refetch: refetchGroups } = useGroups(currentOrg?.id!);

  const onSuccess = () => {
    refetchExpenses();
    refetchGroups();
  }

  const loading = expensesLoading || groupsLoading;

  if (isOrgLoading || !currentOrg) {
    return <Loading />
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header section with Title and Add Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Manage your daily transactions for <span className="font-semibold text-primary">{currentOrg?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseDialog onSuccess={onSuccess} />
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Content Area */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        {
          loading || !expenses ?
            <ExpensesListSkeleton /> :
            <ExpensesList expenses={expenses} groups={groups} onUpdate={onSuccess} />
        }
      </div>
    </div>
  )
}