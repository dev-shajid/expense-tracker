'use server';

import { adminDb } from '@/lib/firebase/admin';
import { revalidateTag } from 'next/cache';
import {
    Expense,
    GroupExpense,
    GiveTakeRecord,
    Organization
} from '@/types';

import {
    getExpenses,
    getExpensesForGroup,
    getGroups,
    getGiveTakes,
    getStats,
    getGroupDetails,
    getUserOrganizations
} from '@/services/data';

// =======================
// Expenses
// =======================

export async function createExpense(
    data: Omit<Expense, 'id'>
) {
    try {
        const docRef = await adminDb
            .collection('expenses')
            .add(data);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function updateExpense(
    id: string,
    data: Partial<Expense>,
    orgId: string,
    oldGroupId?: string
) {
    try {
        await adminDb
            .collection('expenses')
            .doc(id)
            .update(data);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteExpense(
    id: string,
    orgId: string,
    groupId?: string
) {
    try {
        await adminDb
            .collection('expenses')
            .doc(id)
            .delete();

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function updateGroup(
    id: string,
    data: Partial<GroupExpense>,
) {
    try {
        await adminDb
            .collection('groups')
            .doc(id)
            .update(data);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function createGroup(
    data: Omit<GroupExpense, 'id'>
) {
    try {
        const docRef = await adminDb
            .collection('groups')
            .add(data);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteGroup(
    id: string,
    orgId: string
) {
    try {
        await adminDb
            .collection('groups')
            .doc(id)
            .delete();
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function createGiveTake(
    data: Omit<GiveTakeRecord, 'id'>
) {
    try {
        const docRef = await adminDb
            .collection('give_takes')
            .add(data);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}


export async function updateGiveTake(
    id: string,
    data: Partial<GiveTakeRecord>,
    orgId: string
) {
    try {
        await adminDb
            .collection('give_takes')
            .doc(id)
            .update(data);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

// =======================
// Organizations
// =======================

export async function createOrganization(
    data: Omit<Organization, 'id'>
) {
    try {
        const payload = {
            ...data,
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb
            .collection('organizations')
            .add(payload);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function updateOrganization(
    id: string,
    data: Partial<Organization>,
    userId: string
) {
    try {
        const doc = await adminDb
            .collection('organizations')
            .doc(id)
            .get();

        if (!doc.exists) {
            return { success: false, error: 'Not found' };
        }

        const current = doc.data() as Organization;

        if (current.ownerId !== userId) {
            return { success: false, error: 'Not authorized' };
        }

        if (current.isPersonal && data.name) {
            return {
                success: false,
                error: 'Cannot rename Personal organization',
            };
        }

        await adminDb
            .collection('organizations')
            .doc(id)
            .update(data);

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function deleteOrganization(
    id: string,
    userId: string
) {
    try {
        const doc = await adminDb
            .collection('organizations')
            .doc(id)
            .get();

        if (!doc.exists) {
            return { success: false, error: 'Not found' };
        }

        const data = doc.data() as Organization;

        if (data.isPersonal) {
            return {
                success: false,
                error: 'Cannot delete Personal organization',
            };
        }

        if (data.ownerId !== userId) {
            return { success: false, error: 'Not authorized' };
        }

        await adminDb
            .collection('organizations')
            .doc(id)
            .delete();

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

// =======================
// Fetch Wrappers
// =======================

export async function fetchExpenses(orgId: string) {
    return getExpenses(orgId);
}

export async function fetchExpensesForGroup(groupId: string) {
    return getExpensesForGroup(groupId);
}

export async function fetchGroups(orgId: string) {
    return getGroups(orgId);
}

export async function fetchGiveTakes(orgId: string) {
    return getGiveTakes(orgId);
}

export async function fetchStats(orgId: string) {
    return getStats(orgId);
}

export async function fetchGroupDetails(groupId: string) {
    return getGroupDetails(groupId);
}

export async function fetchUserOrganizations(userId: string) {
    return getUserOrganizations(userId);
}



export async function revalidateAllTags(orgId: string, userId: string) {
    revalidateTag(`expenses-org-${orgId}`, {});
    revalidateTag(`stats-org-${orgId}`, {});
    revalidateTag(`expenses-group-${orgId}`, {});
    revalidateTag(`expenses-org-${orgId}`, {});
    revalidateTag(`stats-org-${orgId}`, {});
    revalidateTag(`expenses-group-${orgId}`, {});
    revalidateTag(`expenses-group-${orgId}`, {});
    revalidateTag(`expenses-org-${orgId}`, {});
    revalidateTag(`stats-org-${orgId}`, {});
    revalidateTag(`expenses-group-${orgId}`, {});
    revalidateTag(`groups-org-${orgId}`, {});
    revalidateTag(`group-${orgId}`, {});
    revalidateTag(`groups-org-${orgId}`, {});
    revalidateTag(`give-take-org-${orgId}`, {});
    revalidateTag(`stats-org-${orgId}`, {});
    revalidateTag(`orgs-user-${userId}`, {});
    revalidateTag(`orgs-user-${userId}`, {});
    revalidateTag(`orgs-user-${userId}`, {});
}