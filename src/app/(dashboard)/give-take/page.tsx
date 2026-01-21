"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GiveTakeDialog } from "@/components/give-take/givetake-dialog"
import { ArrowLeftRight, Calendar, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useGiveTakes } from "@/services/give-take.service"
import { GiveTakeListSkeleton } from "@/components/skeletons"

export default function GiveTakePage() {
  const { currentOrg } = useOrganization()

  const { data: records, isLoading } = useGiveTakes(currentOrg?.id!);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Give / Take</h1>
          <p className="text-muted-foreground">Track money you owe or are owed.</p>
        </div>
        <div className="flex items-center gap-2">
          <GiveTakeDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </GiveTakeDialog>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Active Records</h3>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="divide-y divide-border">
            {
              isLoading ? <GiveTakeListSkeleton /> :
                records?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No records yet</h3>
                    <p className="text-sm max-w-sm mx-auto">Add a record to keep track of money you've lent to friends or borrowed.</p>
                  </div>
                ) :
                  records?.map(record => (
                    <GiveTakeDialog key={record.id} record={record}>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4 overflow-hidden">
                          {/* Icon Indicator */}
                          <div className={cn("flex items-center justify-center size-10 rounded-full shrink-0",
                            record.type === 'give' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>
                            <ArrowLeftRight className="size-5" />
                          </div>

                          {/* Main Content */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{record.personName}</span>
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5">{record.type === 'give' ? 'Lens' : 'Borrowed'}</Badge>
                            </div>
                            {/* Description/Notes and Due Date */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 truncate">
                              {record.dueDate && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <Calendar className="size-3" />
                                  {format(new Date(record.dueDate), 'MMM d, y')}
                                </span>
                              )}
                              {record.notes && (
                                <>
                                  <span className="text-muted-foreground/30">•</span>
                                  <span className="truncate">{record.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Status */}
                        <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                          <span className={cn("font-bold text-base tabular-nums", record.type === 'give' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
                            {record.type === 'give' ? '' : ''} {formatCurrency(record.amount)}
                          </span>
                          <Badge variant={record.status === 'settled' ? 'secondary' : 'outline'} className="uppercase text-[10px] h-5">
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </GiveTakeDialog>
                  ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}