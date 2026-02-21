"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { ArrowLeftRight, CreditCard, Plus, Users } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSkeleton } from "@/components/skeletons"

export default function DashboardPage() {
  const { currentOrg, isLoading } = useOrganization()

  if (isLoading || !currentOrg) {
    return <DashboardSkeleton />
  }

  const quickActions = [
    { label: "New Expense", icon: Plus, href: "/expenses", color: "text-red-500", bg: "bg-red-500/10" },
    { label: "New Income", icon: CreditCard, href: "/expenses", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Create Group", icon: Users, href: "/groups", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Lend/Borrow", icon: ArrowLeftRight, href: "/give-take", color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here's what's happening with <span className="font-semibold text-primary">{currentOrg?.name}</span>.
        </p>
      </div>

      <OverviewCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Fast access to common tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="group">
                <div className="flex flex-col items-center justify-center p-6 border rounded-xl hover:bg-muted/50 transition-all hover:scale-105 cursor-pointer h-full space-y-3">
                  <div className={`p-3 rounded-full ${action.bg}`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <span className="font-medium text-sm text-center group-hover:text-primary transition-colors">{action.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest financial updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              No recent activity to show.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}