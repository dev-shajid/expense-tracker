
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
import { Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
// import { toast } from "sonner" // Keeping usage, assuming imports are fine below
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useOrganization } from "@/contexts/OrganizationContext"
import { Expense, GroupExpense } from "@/types"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Loader2 } from "lucide-react"
import { useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/services/expenses.service"
import { useGroups } from "@/services/groups.service"

const formSchema = z.object({
    amount: z.string().min(1, "Amount is required"),
    category: z.string().min(2, "Category is required"),
    type: z.enum(["income", "expense"]),
    date: z.date(),
    notes: z.string().optional(),
    groupId: z.string().optional(),
})


interface ExpenseDialogProps {
    children?: React.ReactNode;
    expense?: Expense;
    defaultGroupId?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ExpenseDialog({ children, expense, defaultGroupId, open: controlledOpen, onOpenChange, onSuccess }: ExpenseDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const { currentOrg } = useOrganization()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const router = useRouter()

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (val: boolean) => {
        if (!createMutation.isPending && !updateMutation.isPending && !deleteMutation.isPending) {
            if (isControlled) onOpenChange!(val);
            else setInternalOpen(val);
        }
    }

    // Queries and Mutations
    const { data: groups = [] } = useGroups(currentOrg?.id || '')
    const createMutation = useCreateExpense()
    const updateMutation = useUpdateExpense()
    const deleteMutation = useDeleteExpense()

    const isLoading = createMutation.isPending || updateMutation.isPending

    const isEdit = !!expense;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            category: "",
            type: "expense",
            date: new Date(),
            notes: "",
            groupId: "none",
        },
    })

    useEffect(() => {
        if (open) {
            if (expense) {
                form.reset({
                    amount: expense.amount.toString(),
                    category: expense.category,
                    type: expense.type,
                    date: new Date(expense.date),
                    notes: expense.notes || "",
                    groupId: expense.groupId || "none",
                })
            } else {
                form.reset({
                    amount: "",
                    category: "",
                    type: "expense",
                    date: new Date(),
                    notes: "",
                    groupId: defaultGroupId || "none",
                })
            }
        }
    }, [open, expense, form, defaultGroupId])

    async function handleDeleteExpense() {
        if (!expense || !currentOrg) return;

        deleteMutation.mutate({
            id: expense.id,
            orgId: currentOrg.id,
            groupId: expense.groupId,
        }, {
            onSuccess: () => {
                setOpen(false)
                if (onSuccess) {
                    onSuccess();
                }
                setDeleteDialogOpen(false);
            },
        });
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        const payload = {
            amount: Number(values.amount),
            category: values.category,
            type: values.type as any,
            date: values.date.toISOString(),
            notes: values.notes,
            groupId: values.groupId === "none" ? undefined : values.groupId,
            organizationId: currentOrg!.id
        };

        if (isEdit && expense) {
            updateMutation.mutate({
                id: expense.id,
                data: payload,
                orgId: currentOrg!.id,
                oldGroupId: expense.groupId,
            }, {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    }
                    setOpen(false)
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    }
                    setOpen(false)
                },
            });
        }
    }

    // Groups are already filtered by server action for the org
    const availableGroups = groups;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button className="shadow-lg shadow-primary/25">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update details for this transaction." : `Record a new income or expense for ${currentOrg?.name}.`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="expense">Expense</SelectItem>
                                                <SelectItem value="income">Income</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Food, Salary, Rent" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="groupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign to Group (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!defaultGroupId || isLoading}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a group" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None (Personal)</SelectItem>
                                            {availableGroups.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>{group.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    disabled={isLoading}
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date:Date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Details about this transaction" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 flex justify-center items-center">
                            {isEdit && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            )}
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Update Changes" : "Save Transaction"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction? This action cannot be undone."
                onConfirm={handleDeleteExpense}
                loading={deleteMutation.isPending}
                confirmText="Delete"
                variant="destructive"
            />
        </Dialog>
    )
}
