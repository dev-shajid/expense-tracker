
import { ExpensesListSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Skeleton className="h-9 w-32" />

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-6">
                {/* Expenses List - Full Width */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-9 w-32" />
                    </div>

                    <ExpensesListSkeleton />
                </div>
            </div>
        </div >
    )
}