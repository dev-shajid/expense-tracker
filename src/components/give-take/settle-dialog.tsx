"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { GiveTakeRecord } from "@/types"
import { useUpdateGiveTake } from "@/services/give-take.service"
import { useOrganization } from "@/contexts/OrganizationContext"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createExpense } from "@/app/actions/db-actions"
import { useQueryClient } from "@tanstack/react-query"

interface SettleDialogProps {
    record: GiveTakeRecord;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SettleDialog({ record, children, open: controlledOpen, onOpenChange }: SettleDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const { currentOrg } = useOrganization()
    const updateMutation = useUpdateGiveTake()
    const queryClient = useQueryClient()

    const [amount, setAmount] = useState<string>((record.amount - (record.settledAmount || 0)).toString())
    const [addToTransactions, setAddToTransactions] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (val: boolean) => {
        if (isControlled) onOpenChange!(val);
        else setInternalOpen(val);
    };

    const remaining = record.amount - (record.settledAmount || 0)

    const handleSettle = async () => {
        const settleVal = Number(amount)
        if (isNaN(settleVal) || settleVal <= 0) {
            toast.error("Please enter a valid amount")
            return
        }
        if (settleVal > remaining) {
            toast.error("Amount cannot exceed remaining balance")
            return
        }

        setIsSubmitting(true)

        try {
            // 1. Update GiveTake Record
            const newSettledAmount = (record.settledAmount || 0) + settleVal
            const isFullySettled = newSettledAmount >= record.amount
            const newStatus = isFullySettled ? 'settled' : 'partially_settled'

            await updateMutation.mutateAsync({
                id: record.id,
                data: {
                    settledAmount: newSettledAmount,
                    status: newStatus
                },
                orgId: currentOrg!.id
            })

            // 2. Add to Transactions if requested
            if (addToTransactions) {
                // Determine type: 
                // record.type === 'take' (Asset). We collected money. -> Income.
                // record.type === 'give' (Liability). We paid money. -> Expense.
                const transactionType = record.type === 'take' ? 'income' : 'expense'

                await createExpense({
                    amount: settleVal,
                    category: 'Debt Settlement',
                    date: new Date().toISOString(),
                    notes: `Settlement for ${record.personName} (${record.notes || ''})`,
                    organizationId: currentOrg!.id,
                    type: transactionType
                })

                // Invalidate expenses/stats
                queryClient.invalidateQueries({ queryKey: ['stats', 'org', currentOrg!.id] })
                queryClient.invalidateQueries({ queryKey: ['expenses', 'org', currentOrg!.id] })
            }

            // Invalidate give-take 
            queryClient.invalidateQueries({ queryKey: ['giveTakes', 'org', currentOrg!.id] })

            toast.success("Settled successfully")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to settle")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settle Record</DialogTitle>
                    <DialogDescription>
                        Settle amount for {record.personName}.
                        Remaining: {formatCurrency(remaining)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Settle Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={remaining}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="add-transaction"
                            checked={addToTransactions}
                            onCheckedChange={(c) => setAddToTransactions(!!c)}
                        />
                        <Label htmlFor="add-transaction">
                            Record in Transactions as {record.type === 'take' ? 'Income' : 'Expense'}?
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSettle} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Settlement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
