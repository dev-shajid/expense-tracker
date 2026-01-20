
import { ExpensesListSkeleton, OverviewCardsSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 pb-24">
            {/* Header section with Title and Add Button */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Overview Cards */}
            <OverviewCardsSkeleton />

            {/* Main Content Area */}
            <div className="grid gap-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-48" />
                </div>

                <ExpensesListSkeleton />
            </div>
        </div>
    )
}
