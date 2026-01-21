
"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Delete, Edit, EllipsisVertical, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpensesListSkeleton } from "@/components/skeletons"
import { GroupDialog } from "@/components/groups/create-group-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteGroup, useGroupDetails, useUpdateGroup } from "@/services/groups.service"
import { useExpensesForGroup } from "@/services/expenses.service"

export default function GroupDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const { currentOrg } = useOrganization()

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const groupId = params.groupId as string

    const { data: group, isLoading: groupLoading, refetch: refetchGroupDetails } = useGroupDetails(groupId)
    const { data: expenses, isLoading: expensesLoading, refetch: refetchExpenses } = useExpensesForGroup(groupId)
    const updateGroup = useUpdateGroup();
    const deleteGroup = useDeleteGroup();

    const handleEditGroup = () => {
        setEditDialogOpen(true)
    }

    const handleDeleteGroup = async () => {
        if (!group || !currentOrg) return;
        deleteGroup.mutate({
            id: group.id,
            orgId: currentOrg.id,
        }, {
            onSettled: () => {
                setActionLoading(false)
                setDeleteDialogOpen(false)
            }
        });
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" className="w-fit -ml-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
                    </Button>

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <EllipsisVertical
                                className="size-4 text-muted-foreground cursor-pointer"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuItem onClick={() => handleEditGroup()}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Group</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                                <Delete className="mr-2 h-4 w-4" />
                                <span>Delete Group</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                        {!groupLoading ? <h1 className="text-3xl font-bold tracking-tight">{group?.title}</h1> : <Skeleton className="h-8 w-64" />}
                        {!groupLoading ? <p className="text-muted-foreground mt-1">{group?.description}</p> : <Skeleton className="h-4 w-32" />}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {!groupLoading ? group?.startDate && <span>{format(new Date(group?.startDate), 'MMM d, yyyy')}</span> : <Skeleton className="h-4 w-20" />}
                            </div>
                            <Badge variant="secondary">Active</Badge>
                        </div>
                    </div>


                    <div className="flex md:items-end items-center justify-between md:justify-end md:flex-col gap-4">
                        {!groupLoading && !expensesLoading ? (() => {
                            const income = expenses?.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) ?? 0;
                            const expense = expenses?.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) ?? 0;
                            const total = income - expense;
                            const isPositive = total >= 0;

                            return (
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-2xl font-bold tabular-nums", isPositive ? "text-emerald-500" : "text-red-500")}>
                                        {isPositive ? "+" : " "} {formatCurrency(total, currentOrg?.currency)}
                                    </span>
                                </div>
                            )
                        })() : <Skeleton className="h-8 w-40" />}
                        <ExpenseDialog defaultGroupId={groupId} onSuccess={() => {
                            refetchExpenses();
                            refetchGroupDetails();
                        }}>
                            <Button size='sm'>
                                <Plus className="mr-2 h-4 w-4" /> Add Group Expense
                            </Button>
                        </ExpenseDialog>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-6">
                {/* Expenses List - Full Width since members/stats are gone */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Transaction History</h2>
                    {!expensesLoading ? <ExpensesList expenses={expenses || []} groups={group ? [group] : []} showGroupBadge={false} onUpdate={() => {
                        refetchExpenses();
                        refetchGroupDetails();
                    }} /> : <ExpensesListSkeleton />}
                </div>
            </div>

            {group && (
                <>
                    <GroupDialog
                        group={group}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        onSuccess={() => {
                            refetchGroupDetails();
                            setEditDialogOpen(false)
                        }}
                    />

                    <ConfirmDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        title="Delete Group"
                        description="Are you sure you want to delete this group? This action cannot be undone."
                        onConfirm={handleDeleteGroup}
                        loading={actionLoading}
                        confirmText="Delete"
                        variant="destructive"
                    />
                </>
            )}
        </div>
    )
}
