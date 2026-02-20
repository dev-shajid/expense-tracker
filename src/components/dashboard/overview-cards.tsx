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
    const { data: stats, isLoading } = useStats(currentOrg?.id!)

    return (
        <div className={cn("grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4", className)}>
            {/* Total Balance */}
            <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-3xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Total Balance</CardTitle>
                    <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent className="pt-0">
                    {!isLoading
                        ? <div className="text-base sm:text-2xl font-bold">{formatCurrency(stats?.currentBalance ?? 0)}</div>
                        : <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
                    }
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Current available money
                    </p>
                </CardContent>
            </Card>

            {/* Income */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Income</CardTitle>
                    <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-emerald-500/10 p-0.5 shrink-0">
                        <ArrowUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {!isLoading
                        ? <div className="text-base sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.totalIncome ?? 0)}</div>
                        : <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
                    }
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Total earnings this period
                    </p>
                </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Expenses</CardTitle>
                    <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-red-500/10 p-0.5 shrink-0">
                        <ArrowDownIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {!isLoading
                        ? <div className="text-base sm:text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(stats?.totalExpense ?? 0)}</div>
                        : <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
                    }
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Total spent this period
                    </p>
                </CardContent>
            </Card>

            {/* Pending Give/Take */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Give / Take</CardTitle>
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-muted-foreground">Give</span>
                            {!isLoading
                                ? <span className="font-semibold text-red-500">{formatCurrency(stats?.pendingToGive ?? 0)}</span>
                                : <Skeleton className="h-4 w-14 sm:w-16" />
                            }
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-muted-foreground">Take</span>
                            {!isLoading
                                ? <span className="font-semibold text-emerald-500">{formatCurrency(stats?.pendingToTake ?? 0)}</span>
                                : <Skeleton className="h-4 w-14 sm:w-16" />
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}