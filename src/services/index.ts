'use server';

import { adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';
import {
    Expense,
    GroupExpense,
    GiveTakeRecord,
    Stats,
    Organization
} from '@/types';

// =======================
// Firestore Converters
// =======================

const expenseConverter = {
    toFirestore: (data: Expense) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({ id: snap.id, ...snap.data() } as Expense),
};

const groupConverter = {
    toFirestore: (data: GroupExpense) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({ id: snap.id, ...snap.data() } as GroupExpense),
};

const giveTakeConverter = {
    toFirestore: (data: GiveTakeRecord) => data,
    fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({ id: snap.id, ...snap.data() } as GiveTakeRecord),
};

// =======================
// DATA FETCHING FUNCTIONS
// =======================

/**
 * Get all expenses for an organization
 * Called by: useExpenses query hook
 */
export const getExpenses = async (orgId: string): Promise<Expense[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('expenses')
        .where('organizationId', '==', orgId)
        .withConverter(expenseConverter)
        .get();

    return snapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get expenses for a specific group
 */
export const getExpensesForGroup = async (groupId: string): Promise<Expense[]> => {
    if (!groupId) return [];

    const snapshot = await adminDb
        .collection('expenses')
        .where('groupId', '==', groupId)
        .withConverter(expenseConverter)
        .get();

    return snapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get all groups for an organization
 * Called by: useGroups query hook
 */
export const getGroups = async (orgId: string): Promise<GroupExpense[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('groups')
        .where('organizationId', '==', orgId)
        .withConverter(groupConverter)
        .get();

    return snapshot.docs.map(doc => doc.data());
};

/**
 * Get a single group by ID
 */
export const getGroupDetails = async (groupId: string): Promise<GroupExpense | null> => {
    if (!groupId) return null;

    const doc = await adminDb
        .collection('groups')
        .doc(groupId)
        .withConverter(groupConverter)
        .get();

    return doc.exists ? doc.data() ?? null : null;
};

/**
 * Get all give/take records for an organization
 */
export const getGiveTakes = async (orgId: string): Promise<GiveTakeRecord[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('give_takes')
        .where('organizationId', '==', orgId)
        .withConverter(giveTakeConverter)
        .get();

    return snapshot.docs.map(doc => doc.data());
};

/**
 * Calculate financial stats for an organization
 */
export const getStats = async (orgId: string): Promise<Stats> => {
    if (!orgId) {
        return {
            currentBalance: 0,
            totalIncome: 0,
            totalExpense: 0,
            pendingToGive: 0,
            pendingToTake: 0,
        };
    }

    const [expensesSnap, giveTakeSnap] = await Promise.all([
        adminDb
            .collection('expenses')
            .where('organizationId', '==', orgId)
            .get(),
        adminDb
            .collection('give_takes')
            .where('organizationId', '==', orgId)
            .get(),
    ]);

    const expenses = expensesSnap.docs.map(d => d.data() as Expense);
    const giveTakes = giveTakeSnap.docs.map(d => d.data() as GiveTakeRecord);

    const totalIncome = expenses
        .filter(e => e.type === 'income')
        .reduce((s, e) => s + e.amount, 0);

    const totalExpense = expenses
        .filter(e => e.type === 'expense')
        .reduce((s, e) => s + e.amount, 0);

    const pendingToGive = giveTakes
        .filter(e => e.type === 'give' && e.status !== 'settled')
        .reduce((s, e) => s + (e.amount - e.settledAmount), 0);

    const pendingToTake = giveTakes
        .filter(e => e.type === 'take' && e.status !== 'settled')
        .reduce((s, e) => s + (e.amount - e.settledAmount), 0);

    return {
        currentBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        pendingToGive,
        pendingToTake,
    };
};

/**
 * Get all organizations for a user
 */
export const getUserOrganizations = async (userId: string): Promise<Organization[]> => {
    if (!userId) return [];

    const snapshot = await adminDb
        .collection('organizations')
        .where('ownerId', '==', userId)
        .get();

    return snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() } as Organization)
    );
};

// =======================
// EXPENSE MUTATIONS
// =======================

/**
 * Create a new expense
 * Revalidates cache to trigger TanStack Query refetch
 */
export async function createExpense(
    data: Omit<Expense, 'id'>
) {
    try {
        const docRef = await adminDb
            .collection('expenses')
            .add(data);

        // Revalidate expenses path - triggers instant UI update via TanStack Query
        revalidatePath('/expenses', 'page');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Failed to create expense:', error);
        return { success: false };
    }
}

/**
 * Update an existing expense
 * Revalidates cache to trigger TanStack Query refetch
 */
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

        // Revalidate expenses path - triggers instant UI update via TanStack Query
        revalidatePath('/expenses', 'page');

        return { success: true };
    } catch (error) {
        console.error('Failed to update expense:', error);
        return { success: false };
    }
}

/**
 * Delete an expense
 * Revalidates cache to trigger TanStack Query refetch
 */
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

        // Revalidate expenses path - triggers instant UI update via TanStack Query
        revalidatePath('/expenses', 'page');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete expense:', error);
        return { success: false };
    }
}

// =======================
// GROUP MUTATIONS
// =======================

/**
 * Update a group
 */
export async function updateGroup(
    id: string,
    data: Partial<GroupExpense>,
    orgId: string
) {
    try {
        await adminDb
            .collection('groups')
            .doc(id)
            .update(data);

        revalidatePath('/expenses', 'page');

        return { success: true };
    } catch (error) {
        console.error('Failed to update group:', error);
        return { success: false };
    }
}

/**
 * Delete a group
 */
export async function deleteGroup(
    id: string,
    orgId: string
) {
    try {
        await adminDb
            .collection('groups')
            .doc(id)
            .delete();

        revalidatePath('/expenses', 'page');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete group:', error);
        return { success: false };
    }
}

// =======================
// GIVE/TAKE MUTATIONS
// =======================

/**
 * Create a new give/take record
 */
export async function createGiveTake(
    data: Omit<GiveTakeRecord, 'id'>
) {
    try {
        const docRef = await adminDb
            .collection('give_takes')
            .add(data);

        revalidatePath('/expenses', 'page');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Failed to create give/take:', error);
        return { success: false };
    }
}

/**
 * Update a give/take record
 */
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

        revalidatePath('/expenses', 'page');

        return { success: true };
    } catch (error) {
        console.error('Failed to update give/take:', error);
        return { success: false };
    }
}

// =======================
// ORGANIZATION MUTATIONS
// =======================

/**
 * Create a new organization
 */
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

        revalidatePath('/', 'layout');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Failed to create organization:', error);
        return { success: false };
    }
}

/**
 * Update an organization
 * Only owner can update
 */
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

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error) {
        console.error('Failed to update organization:', error);
        return { success: false };
    }
}

/**
 * Delete an organization
 * Only owner can delete, and cannot delete personal org
 */
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

        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete organization:', error);
        return { success: false };
    }
}

// =======================
// PUBLIC API EXPORTS
// =======================
// These are convenience wrappers for the data fetching functions
// They can be called directly from TanStack Query hooks

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