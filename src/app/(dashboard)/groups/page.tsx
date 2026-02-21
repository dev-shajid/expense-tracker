"use client"

import { useOrganization } from "@/contexts/OrganizationContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { GroupsListSkeleton } from "@/components/skeletons"
import { useGroups } from "@/services/groups.service"
import Loading from "./loading"

export const dynamic = 'force-dynamic';

export default function GroupsPage() {
  const { currentOrg, isLoading: isOrgLoading } = useOrganization()
  const { data: groups, isLoading: loading, refetch: refetchGroups } = useGroups(currentOrg?.id!);

  if (isOrgLoading || !currentOrg) {
    return <Loading />
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage shared expenses for trips, projects, or events.</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateGroupDialog onSuccess={refetchGroups} />
        </div>
      </div>

      {
        loading ?
          <GroupsListSkeleton /> :
          groups?.length ?
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {groups?.map((group, i) => (
                <Link key={i} href={`/groups/${group.id}`} className="contents">
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg">{group.title}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {group.description && <p className="text-xs text-muted-foreground mt-1 mb-4">{group.description}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Badge variant="outline">{new Date(group.startDate).toLocaleDateString()}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div> :
            <div className="text-center py-12 border border-dashed rounded-lg">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No groups yet</h3>
              <p className="text-muted-foreground">Create a group to start tracking shared expenses.</p>
            </div>
      }
    </div>
  )
}