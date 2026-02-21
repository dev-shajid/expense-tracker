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
import { SettleDialog } from "@/components/give-take/settle-dialog"
import Loading from "./loading"

export default function GiveTakePage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const { data: records, isLoading } = useGiveTakes(currentOrg?.id!)
  const activeRecords = records?.filter(r => r.status !== 'settled') || []

  if (isOrgLoading || !currentOrg) {
    return <Loading />
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Give / Take</h1>
          <p className="text-sm text-muted-foreground">Track future payables and receivables.</p>
        </div>
        <div className="flex items-center gap-2">
          <GiveTakeDialog>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </GiveTakeDialog>
        </div>
      </div>

      {/* Active Records */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wider">Active Records</h3>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="divide-y divide-border">
            {isLoading ? (
              <GiveTakeListSkeleton />
            ) : activeRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No active records</h3>
                <p className="text-sm max-w-sm mx-auto">
                  Add a record to keep track of money you need to take or give.
                </p>
              </div>
            ) : (
              activeRecords.map(record => (
                <GiveTakeDialog key={record.id} record={record}>
                  <div className="flex items-start justify-between gap-3 p-3 sm:p-4 hover:bg-muted/40 transition-colors cursor-pointer group">

                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Icon */}
                      <div className={cn(
                        "flex items-center justify-center size-9 sm:size-10 rounded-full shrink-0 mt-0.5",
                        record.type === 'give'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      )}>
                        <ArrowLeftRight className="size-4 sm:size-5" />
                      </div>

                      {/* Text Content */}
                      <div className="flex flex-col min-w-0 gap-1">
                        {/* Name + Badge row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-sm sm:text-base leading-tight">
                            {record.personName}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-4 px-1.5 uppercase shrink-0",
                              record.type === 'give'
                                ? "border-red-200 text-red-600"
                                : "border-emerald-200 text-emerald-600"
                            )}
                          >
                            {record.type === 'give' ? 'To Give' : 'To Take'}
                          </Badge>
                        </div>

                        {/* Due date + notes */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          {record.dueDate && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="size-3" />
                              {format(new Date(record.dueDate), 'MMM d, y')}
                            </span>
                          )}
                          {record.notes && record.dueDate && (
                            <span className="text-muted-foreground/30">•</span>
                          )}
                          {record.notes && (
                            <span className="truncate max-w-40 sm:max-w-xs">{record.notes}</span>
                          )}
                        </div>

                        {/* Mobile-only: amount + status stacked under name */}
                        <div className="flex items-center gap-2 sm:hidden mt-0.5">
                          <span className={cn(
                            "font-bold text-sm tabular-nums",
                            record.type === 'give'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          )}>
                            {record.type === 'give' ? '-' : '+'} {formatCurrency(record.amount)}
                          </span>
                          <Badge
                            variant={record.status === 'settled' ? 'secondary' : 'outline'}
                            className="uppercase text-[10px] h-4"
                          >
                            {record.status.replace('_', ' ')}
                          </Badge>
                          {record.settledAmount > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {Math.round((record.settledAmount / record.amount) * 100)}% Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount + Status + Settle (desktop only for amount/status) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Desktop-only amount + status */}
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className={cn(
                          "font-bold text-base tabular-nums",
                          record.type === 'give'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}>
                          {record.type === 'give' ? '-' : '+'} {formatCurrency(record.amount)}
                        </span>
                        <div className="flex items-center gap-2">
                          {record.settledAmount > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {Math.round((record.settledAmount / record.amount) * 100)}% Paid
                            </span>
                          )}
                          <Badge
                            variant={record.status === 'settled' ? 'secondary' : 'outline'}
                            className="uppercase text-[10px] h-5"
                          >
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Settle button — always visible */}
                      {record.status !== 'settled' && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <SettleDialog record={record}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                              <span className="sr-only">Settle</span>
                            </Button>
                          </SettleDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </GiveTakeDialog>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}