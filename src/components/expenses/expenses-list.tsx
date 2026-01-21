"use client"

import { Expense, GroupExpense } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { Badge } from "@/components/ui/badge"

interface ExpensesListProps {
    expenses: Expense[];
    groups?: GroupExpense[];
    showGroupBadge?: boolean;
    className?: string;
    onUpdate?: () => void;
}

export function ExpensesList({ expenses, groups, className, showGroupBadge = true, onUpdate }: ExpensesListProps) {
    // Helper to get group name
    // In a real app with proper relational data, this would be easier (e.g. expense.group.title)
    // Here we'll do a quick lookup
    const getGroupName = (expense: Expense) => {
        if (expense.groupId && expense.groupId !== 'none') {
            const groupList = groups || [];
            const group = groupList.find(g => g.id === expense.groupId);
            return group?.title;
        }
        return null;
    }

    const groupedExpenses = expenses.reduce((acc, expense) => {
        const date = format(new Date(expense.date), 'yyyy-MM-dd')
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(expense)
        return acc
    }, {} as Record<string, Expense[]>)

    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                No transactions found.
            </div>
        )
    }

    return (
        <div className={cn("space-y-6", className)}>
            {sortedDates.map((date) => (
                <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2 ml-1">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {format(new Date(date), 'MMMM do, yyyy')}
                        </h3>
                        {/* 
                           "write the group label or name besides the date" 
                           If ALL expenses in this date belong to the same group, show it here?
                        */}
                        {(() => {
                            if (!showGroupBadge) return null;
                            const firstGroup = getGroupName(groupedExpenses[date][0]);
                            const allSame = groupedExpenses[date].every(e => getGroupName(e) === firstGroup);
                            if (firstGroup && allSame) {
                                return <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 font-normal text-muted-foreground">{firstGroup}</Badge>
                            }
                            return null;
                        })()}
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="divide-y divide-border">
                            {groupedExpenses[date].map((expense) => {
                                const groupName = getGroupName(expense); // Check if this expense belongs to a group

                                return (
                                    <ExpenseDialog key={expense.id} expense={expense} onSuccess={onUpdate}>
                                        <div className="flex items-center justify-between p-3 hover:bg-muted/40 transition-colors group cursor-pointer">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={cn("size-2 rounded-full shrink-0", expense.type === 'income' ? 'bg-emerald-500' : 'bg-red-500')} />
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium truncate text-sm">{expense.category}</span>
                                                        {showGroupBadge && groupName && <Badge variant="secondary" className="text-[10px] h-4 px-1">{groupName}</Badge>}
                                                    </div>
                                                    {expense.notes && <span className="text-[10px] text-muted-foreground truncate">{expense.notes}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className={cn("text-sm font-semibold tabular-nums", expense.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                                                    {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </ExpenseDialog>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
