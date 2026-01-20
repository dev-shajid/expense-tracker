"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { TeamSwitcher } from "./team-switch"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { ManageOrganizationsDialog } from "./manage-organizations-dialog"
import { Settings } from "lucide-react"
import { useState } from "react"

export default function Header() {
    const { user, signOut } = useAuth()
    const [showManageOrgs, setShowManageOrgs] = useState(false)

    const initials = user?.displayName
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <header className="border-b border-border py-4">
            <div className="flex items-center justify-between container">
                <TeamSwitcher user={user} />

                <div className="flex items-center gap-4">
                    {
                        user ? <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer">
                                    {user?.photoURL ? <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} /> : <AvatarFallback>{initials}</AvatarFallback>}
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => setShowManageOrgs(true)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Manage Organizations</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu> : <Skeleton className="size-9 rounded-full" />
                    }
                </div>
            </div>

            <ManageOrganizationsDialog
                open={showManageOrgs}
                onOpenChange={setShowManageOrgs}
            />
        </header>
    )
}