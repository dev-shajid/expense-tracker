
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useOrganization } from "@/contexts/OrganizationContext"
import { Skeleton } from "../ui/skeleton"
import { useStats } from "@/services/organizations.service"

interface OverviewCardsProps {
    className?: string;
}

export function OverviewCards({ className }: OverviewCardsProps) {
    const { currentOrg } = useOrganization()
    const {data: stats, isLoading} = useStats(currentOrg?.id!)


    return (
        <div className={cn("grid gap-4 grid-cols-2 lg:grid-cols-4", className)}>
            <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-3xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {!isLoading ? <div className="sm:text-2xl text-lg font-bold">{formatCurrency(stats?.currentBalance ?? 0)}</div> : <Skeleton className="h-8 w-24" />}
                    <p className="text-xs text-muted-foreground">
                        Current available money
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Income</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 p-0.5">
                        <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    {!isLoading ? <div className="sm:text-2xl text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.totalIncome ?? 0)}</div> : <Skeleton className="h-8 w-24" />}

                    <p className="text-xs text-muted-foreground">
                        Total earnings this period
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-red-500/10 p-0.5">
                        <ArrowDownIcon className="h-3 w-3 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    {!isLoading ? <div className="sm:text-2xl text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.totalExpense ?? 0)}</div> : <Skeleton className="h-8 w-24" />}
                    <p className="text-xs text-muted-foreground">
                        Total spent this period
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Give/Take</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>To Give:</span>
                            {!isLoading ? <span className="font-medium text-red-500">{formatCurrency(stats?.pendingToGive ?? 0)}</span> : <Skeleton className="h-4 w-16" />}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>To Take:</span>
                            {!isLoading ? <span className="font-medium text-emerald-500">{formatCurrency(stats?.pendingToTake ?? 0)}</span> : <Skeleton className="h-4 w-16" />}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
