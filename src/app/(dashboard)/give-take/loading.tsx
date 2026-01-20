
import { GiveTakeListSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <GiveTakeListSkeleton />
            </div>
        </div>
    )
}
