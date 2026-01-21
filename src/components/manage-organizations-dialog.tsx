"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOrganization } from "@/contexts/OrganizationContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Trash2, Building2, Pencil, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "./confirm-dialog"
import { useUpdateOrganization, useDeleteOrganization } from "@/services/organizations.service"
import { toast } from "sonner"

interface ManageOrganizationsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ManageOrganizationsDialog({ open, onOpenChange }: ManageOrganizationsDialogProps) {
    const { organizations, currentOrg } = useOrganization()
    const { user } = useAuth()
    const [confirmId, setConfirmId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const updateMutation = useUpdateOrganization()
    const deleteMutation = useDeleteOrganization()

    function handleDelete() {
        if (!user || !confirmId) return;

        // Prevent deleting current organization
        if (currentOrg?.id === confirmId) {
            toast.error("Cannot delete the currently active organization. Switch to a different organization first.");
            setConfirmId(null);
            return;
        }

        deleteMutation.mutate({
            id: confirmId,
            userId: user.uid,
        }, {
            onSuccess: () => {
                setConfirmId(null);
                toast.success("Organization deleted successfully");
            },
            onError: () => {
                toast.error("Failed to delete organization");
            }
        });
    }

    function handleUpdateName(orgId: string) {
        if (!user || !editName.trim()) return;

        if (editName === organizations.find(o => o.id === orgId)?.name) {
            setEditingId(null);
            return;
        }

        updateMutation.mutate({
            id: orgId,
            data: { name: editName },
            userId: user.uid,
        }, {
            onSuccess: () => {
                setEditingId(null);
                toast.success("Organization name updated");
            },
            onError: () => {
                toast.error("Failed to update organization name");
            }
        });
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Organizations</DialogTitle>
                        <DialogDescription>
                            View and manage your organizations. "Personal" workspace cannot be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {organizations.map((org) => (
                            <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg bg-card group">
                                <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
                                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
                                        <Building2 className="size-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        {editingId === org.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="h-7 text-sm"
                                                    disabled={updateMutation.isPending}
                                                />
                                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-emerald-500" onClick={() => handleUpdateName(org.id)} disabled={updateMutation.isPending}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)} disabled={updateMutation.isPending}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="font-medium truncate">{org.name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {!org.isPersonal && editingId !== org.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setEditingId(org.id);
                                                setEditName(org.name);
                                            }}
                                        >
                                            <Pencil className="size-4 text-muted-foreground" />
                                        </Button>
                                    )}

                                    {org.isPersonal ? null : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => setConfirmId(org.id)}
                                            disabled={!!editingId}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {organizations.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                                No organizations found.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!confirmId}
                onOpenChange={(open) => !open && setConfirmId(null)}
                title="Delete Organization?"
                description="This will permanently delete this organization and its data. This action cannot be undone."
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
                confirmText="Delete it"
                variant="destructive"
            />
        </>
    )
}
