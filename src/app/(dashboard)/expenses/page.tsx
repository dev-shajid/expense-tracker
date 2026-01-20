"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { useEffect, useState } from "react"
import { fetchExpenses, fetchStats, fetchGroups } from "@/app/actions/db-actions"
import { Expense, Stats, GroupExpense } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ExpensesListSkeleton } from "@/components/skeletons"

export default function ExpensesPage() {
  const { currentOrg } = useOrganization()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [groups, setGroups] = useState<GroupExpense[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    if (!currentOrg) return;
    // Don't set loading to true for background refresh to avoid flickering unless it's initial
    if (expenses.length === 0) setLoading(true);

    try {
      const [fetchedExpenses, fetchedGroups] = await Promise.all([
        fetchExpenses(currentOrg.id),
        fetchGroups(currentOrg.id)
      ]);
      setExpenses(fetchedExpenses);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentOrg]);

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
          <ExpenseDialog onSuccess={loadData} />
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
          loading ?
            <ExpensesListSkeleton /> :
            <ExpensesList expenses={expenses} groups={groups} onUpdate={loadData} />
        }
      </div>
    </div>
  )
}