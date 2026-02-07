
"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useOrganization } from "@/contexts/OrganizationContext"
import { Loader2 } from "lucide-react"
import { GroupExpense } from "@/types"
import { useCreateGroup, useUpdateGroup } from "@/services/groups.service"

const formSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
})

interface GroupDialogProps {
    group?: GroupExpense;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function GroupDialog({ group, children, open: controlledOpen, onOpenChange, onSuccess }: GroupDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const { currentOrg } = useOrganization()
    const createMutation = useCreateGroup()
    const updateMutation = useUpdateGroup()

    const isLoading = createMutation.isPending || updateMutation.isPending

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const setOpen = (val: boolean) => {
        if (!isLoading) {
            if (isControlled) {
                if (onOpenChange) onOpenChange(val);
            } else {
                setInternalOpen(val);
                if (onOpenChange) onOpenChange(val);
            }
        }
    }

    const isEdit = !!group;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    })

    useEffect(() => {
        if (open) {
            if (group) {
                form.reset({
                    title: group.title,
                    description: group.description || "",
                })
            } else {
                form.reset({
                    title: "",
                    description: "",
                })
            }
        }
    }, [open, group, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        const payload: Omit<GroupExpense, "id"> = {
            title: values.title,
            description: values.description,
            startDate: new Date().toISOString(),
            totalAmount: 0,
            organizationId: currentOrg!.id
        };

        if (isEdit && group) {
            updateMutation.mutate({
                id: group.id,
                data: {
                    title: values.title,
                    description: values.description
                },
                orgId: currentOrg!.id,
            }, {
                onSuccess: () => {
                    setOpen(false)
                    if (onSuccess) onSuccess();
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                    if (onSuccess) onSuccess();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!group && <DialogTrigger asChild>
                {children ? children : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Group
                    </Button>
                )}
            </DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Group" : "Create Group"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update group details." : "Create a group to track shared expenses (e.g. Trips, Projects)."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Summer Vacation, Office renovation" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief description of the group" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Save Changes" : "Create Group"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export { GroupDialog as CreateGroupDialog }
