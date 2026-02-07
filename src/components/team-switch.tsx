"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { useOrganization } from "@/contexts/OrganizationContext"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { User } from "firebase/auth"
import { useCreateOrganization } from "@/services/organizations.service"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Organization name must be at least 2 characters.",
    }),
})

export function TeamSwitcher({ user }: { user: User | null }) {
    const { currentOrg, setCurrentOrg, organizations } = useOrganization()
    const [open, setOpen] = React.useState(false)

    if (!currentOrg) {
        return <Skeleton className="w-40 h-8 rounded-md" />
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-[140px] sm:w-[200px] justify-between"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <div className="flex items-center justify-center size-5 rounded bg-primary/10">
                                <Building2 className="size-3 text-primary" />
                            </div>
                            <span className="truncate">{currentOrg.name}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-50"
                    align="start"
                >
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                        Organizations
                    </DropdownMenuLabel>
                    {organizations.map((org) => (
                        <DropdownMenuItem
                            key={org.id}
                            onClick={async () => {
                                setCurrentOrg(org)
                            }}
                            className="gap-2 cursor-pointer"
                        >
                            <div className="flex size-6 items-center justify-center rounded-sm border">
                                <Building2 className="size-4" />
                            </div>
                            {org.name}
                            {/* {org.id === currentOrg.id && <Check className="ml-auto h-4 w-4" />} */}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                            <Plus className="size-4" />
                        </div>
                        <div className="text-muted-foreground font-medium">Add Organization</div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <NewOrganizationModal
                open={open}
                onOpenChange={setOpen}
            />
        </>
    )
}

function NewOrganizationModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { user } = useAuth(); // Need to import this at top level
    const createOrganization = useCreateOrganization()
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;

        const newOrg = {
            name: values.name,
            currency: 'BDT',
            ownerId: user.uid
        };

        createOrganization.mutate(newOrg, {
            onSuccess: (data) => {
                toast.success("Organization Created", {
                    description: `Workspace "${values.name}" is ready.`
                })
                onOpenChange(false)
                form.reset()
                router.refresh(); // Refresh to pick up new org in context
            },
            onError: () => {
                toast.error("Failed to create organization");
            }
        });
    }
    return (
        <Dialog open={open} onOpenChange={(val) => !createOrganization.isPending && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Organization</DialogTitle>
                    <DialogDescription>
                        Create a new space to manage expenses separately.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={createOrganization.isPending} placeholder="My Business" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={createOrganization.isPending}>
                            {createOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}