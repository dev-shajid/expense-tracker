
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OverviewCardsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-25" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-30 mb-2" />
                        <Skeleton className="h-3 w-37.5" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function ExpensesListSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32 ml-1" />
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="divide-y divide-border">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <div key={j} className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function GroupsListSkeleton() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="size-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function GiveTakeListSkeleton() {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-24">
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            <OverviewCardsSkeleton />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 lg:col-span-5">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-xl" />
                        ))}
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
