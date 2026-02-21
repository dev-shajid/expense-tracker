
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserOrganizations, useCreateOrganization } from '@/services/organizations.service';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationContextType {
    currentOrg: Organization | null;
    setCurrentOrg: (org: Organization) => void;
    organizations: Organization[];
    isLoading: boolean;
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [isCreatingDefault, setIsCreatingDefault] = useState(false);
    const { data: orgs = [], isLoading } = useUserOrganizations(user?.uid || '');
    const createOrgMutation = useCreateOrganization();

    useEffect(() => {
        if (!user || isLoading) return;

        // Check if user has a personal organization
        const hasPersonalOrg = orgs.some((org: Organization) => org.isPersonal);

        if (orgs.length === 0 && !hasPersonalOrg && !isCreatingDefault) {
            // Create default Personal organization only once
            setIsCreatingDefault(true);
            const newOrg = {
                name: 'Personal',
                isPersonal: true,
                currency: 'BDT',
                ownerId: user.uid,
                createdAt: new Date().toISOString()
            };
            createOrgMutation.mutate(newOrg, {
                onSuccess: () => {
                    setIsCreatingDefault(false);
                },
                onError: () => {
                    setIsCreatingDefault(false);
                    toast.error('Failed to create default organization');
                }
            });
        } else if (orgs.length > 0 && !isCreatingDefault) {
            // Sort orgs by createdAt asc (oldest first)
            const sortedOrgs = [...orgs].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
            });
            // Set cached org or default to first
            const lastOrgId = localStorage.getItem('lastOrgId');
            const found = sortedOrgs.find((o: Organization) => o.id === lastOrgId);
            setCurrentOrg(found || sortedOrgs[0]);
        }
    }, [user, orgs, isLoading]);

    const handleSetCurrentOrg = (org: Organization) => {
        setCurrentOrg(org);
        if (org?.id) localStorage.setItem('lastOrgId', org.id);

    };

    if (isLoading && orgs.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className='space-y-4 max-w-80 w-full'>
                    <Skeleton className="max-w-80 w-full h-6" />
                    <Skeleton className="w-50 h-6" />
                    <Skeleton className="w-30 h-6" />
                </div>
            </div>
        );
    }

    return (
        <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg: handleSetCurrentOrg, organizations: orgs, isLoading }}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}
