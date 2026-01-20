
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stats } from "@/types"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { fetchStats } from "@/app/actions/db-actions"
import { useOrganization } from "@/contexts/OrganizationContext"
import { Skeleton } from "../ui/skeleton"

interface OverviewCardsProps {
    className?: string;
}

export function OverviewCards({ className }: OverviewCardsProps) {
    const { currentOrg } = useOrganization()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    async function loadData() {
        try {
            setLoading(true);
            const fetchedStats = await fetchStats(currentOrg?.id!);
            setStats(fetchedStats);
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
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
            <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-3xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {!loading ? stats?.currentBalance && <div className="text-2xl font-bold">{formatCurrency(stats?.currentBalance)}</div> : <Skeleton className="h-8 w-24" />}
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
                    {!loading ? stats?.totalIncome && <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.totalIncome)}</div> : <Skeleton className="h-8 w-24" />}

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
                    {!loading ? stats?.totalExpense && <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.totalExpense)}</div> : <Skeleton className="h-8 w-24" />}
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
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                            <span>To Give:</span>
                            {!loading ? stats?.pendingToGive && <span className="font-medium text-red-500">{formatCurrency(stats?.pendingToGive)}</span> : <Skeleton className="h-4 w-16" />}
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>To Take:</span>
                            {!loading ? stats?.pendingToTake && <span className="font-medium text-emerald-500">{formatCurrency(stats?.pendingToTake)}</span> : <Skeleton className="h-4 w-16" />}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
