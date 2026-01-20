
"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Delete, Edit, EllipsisVertical, Plus, Search } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { useEffect, useState } from "react"
import { Expense, GroupExpense } from "@/types"
import { fetchExpensesForGroup, fetchGroupDetails } from "@/app/actions/db-actions"
import { formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpensesListSkeleton } from "@/components/skeletons"
import { GroupDialog } from "@/components/groups/create-group-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { deleteGroup } from "@/app/actions/db-actions"
import { toast } from "sonner"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function GroupDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const { currentOrg } = useOrganization()

    const [group, setGroup] = useState<GroupExpense | null>(null)
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const groupId = params.groupId as string

    const fetchGroupData = async () => {
        if (!groupId) return;
        try {
            const [groupData, expensesData] = await Promise.all([
                fetchGroupDetails(groupId),
                fetchExpensesForGroup(groupId)
            ]);
            setGroup(groupData);
            setExpenses(expensesData);
        } catch (error) {
            console.error("Failed to load group details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [groupId]);

    const handleEditGroup = () => {
        setEditDialogOpen(true)
    }

    const handleDeleteGroup = async () => {
        if (!group || !currentOrg) return;
        setActionLoading(true)
        try {
            const result = await deleteGroup(group.id, currentOrg.id)
            if (result.success) {
                toast.success("Group deleted")
                router.push('/groups')
            } else {
                toast.error("Failed to delete group")
            }
        } catch (e) {
            toast.error("Something went wrong")
            console.error(e)
        } finally {
            setActionLoading(false)
            setDeleteDialogOpen(false)
        }
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
                        {!loading ? <h1 className="text-3xl font-bold tracking-tight">{group?.title}</h1> : <Skeleton className="h-8 w-64" />}
                        {!loading ? <p className="text-muted-foreground mt-1">{group?.description}</p> : <Skeleton className="h-4 w-32" />}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {!loading ? group?.startDate && <span>{format(new Date(group?.startDate), 'MMM d, yyyy')}</span> : <Skeleton className="h-4 w-20" />}
                            </div>
                            <Badge variant="secondary">Active</Badge>
                        </div>
                    </div>


                    <div className="flex md:items-end items-center justify-between md:justify-end md:flex-col gap-4">
                        {!loading ? (() => {
                            const income = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
                            const expense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
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
                        <ExpenseDialog defaultGroupId={groupId} onSuccess={fetchGroupData}>
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
                    {!loading ? <ExpensesList expenses={expenses} groups={group ? [group] : []} showGroupBadge={false} onUpdate={fetchGroupData} /> : <ExpensesListSkeleton />}
                </div>
            </div>

            {group && (
                <>
                    <GroupDialog
                        group={group}
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        onSuccess={() => {
                            fetchGroupData()
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
