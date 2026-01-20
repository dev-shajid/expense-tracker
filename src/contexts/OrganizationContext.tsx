
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization } from '@/types';
import { MOCK_ORGS } from '@/lib/store';

interface OrganizationContextType {
    currentOrg: Organization | null;
    setCurrentOrg: (org: Organization) => void;
    organizations: Organization[];
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);


// Re-implementing with imports:
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserOrganizations, createOrganization } from '@/app/actions/db-actions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    useEffect(() => {
        async function loadOrgs() {
            if (!user) return;
            setLoading(true);
            try {
                const orgs = await fetchUserOrganizations(user.uid);

                if (orgs.length === 0) {
                    // Create default Personal organization
                    const newOrg = {
                        name: 'Personal',
                        isPersonal: true,
                        currency: 'BDT',
                        ownerId: user.uid,
                        createdAt: new Date().toISOString()
                    };
                    const result = await createOrganization(newOrg);
                    if (result.success) {
                        const createdOrg = { ...newOrg, id: result.id! };
                        setOrganizations([createdOrg]);
                        setCurrentOrg(createdOrg);
                        toast.success("Welcome! Created your Personal workspace.");
                    }
                } else {
                    // Sort orgs by createdAt asc (oldest first)
                    const sortedOrgs = orgs.sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateA - dateB;
                    });
                    setOrganizations(sortedOrgs);
                    // Set cached org or default to first
                    const lastOrgId = localStorage.getItem('lastOrgId');
                    const found = orgs.find((o: Organization) => o.id === lastOrgId);
                    setCurrentOrg(found || orgs[0]);
                }
            } catch (error) {
                console.error("Failed to load organizations", error);
            } finally {
                setLoading(false);
            }
        }

        loadOrgs();
    }, [user]);

    const handleSetCurrentOrg = (org: Organization) => {
        setCurrentOrg(org);
        if (org?.id) localStorage.setItem('lastOrgId', org.id);
        
    };

    if (loading) {
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
        <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg: handleSetCurrentOrg, organizations }}>
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
