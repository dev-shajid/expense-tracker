
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useOrganization } from "@/contexts/OrganizationContext"
import { GiveTakeRecord } from "@/types"
import { useCreateGiveTake, useUpdateGiveTake } from "@/services/give-take.service"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    personName: z.string().min(2, "Person name is required"),
    amount: z.string().min(1, "Amount is required"),
    type: z.enum(["give", "take"]),
    dueDate: z.date().optional(),
    notes: z.string().optional(),
})

interface GiveTakeDialogProps {
    children?: React.ReactNode; // Trigger
    record?: GiveTakeRecord; // If present, edit mode
    open?: boolean; // Controlled state
    onOpenChange?: (open: boolean) => void;
}

export function GiveTakeDialog({ children, record, open: controlledOpen, onOpenChange }: GiveTakeDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const { currentOrg } = useOrganization()
    const createMutation = useCreateGiveTake()
    const updateMutation = useUpdateGiveTake()

    const isLoading = createMutation.isPending || updateMutation.isPending

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (val: boolean) => {
        if (!isLoading) {
            if (isControlled) onOpenChange!(val);
            else setInternalOpen(val);
        }
    };

    const isEdit = !!record;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            personName: "",
            amount: "",
            type: "take",
            notes: "",
        },
    })

    // Reset form when record changes or dialog opens
    useEffect(() => {
        if (open) {
            if (record) {
                form.reset({
                    personName: record.personName,
                    amount: record.amount.toString(),
                    type: record.type,
                    dueDate: record.dueDate ? new Date(record.dueDate) : undefined,
                    notes: record.notes || ""
                })
            } else {
                form.reset({
                    personName: "",
                    amount: "",
                    type: "take",
                    notes: ""
                })
            }
        }
    }, [open, record, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        const payload = {
            personName: values.personName,
            amount: Number(values.amount),
            type: values.type as any,
            status: 'pending' as const,
            dueDate: values.dueDate?.toISOString(),
            notes: values.notes,
            organizationId: currentOrg!.id,
            settledAmount: 0,
            createdAt: new Date().toISOString()
        };

        if (isEdit && record) {
            updateMutation.mutate({
                id: record.id,
                data: payload,
                orgId: currentOrg!.id,
            }, {
                onSuccess: () => {
                    setOpen(false)
                },
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-106">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Record" : "Add Give/Take Record"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update details for this transaction." : "Track money you lent or borrowed."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="give">Give (Lend)</SelectItem>
                                            <SelectItem value="take">Take (Borrow)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="personName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Person / Entity Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
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
                                        <Input type="number" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Due Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
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
                                                initialFocus
                                            // disabled={(date) => date < new Date()} // Allow past dates for editing/created records
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
                                    <FormLabel>Notes / Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Any details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? "Update Changes" : "Save Record"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
