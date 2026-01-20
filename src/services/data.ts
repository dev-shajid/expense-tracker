'use cache';

import { adminDb } from '@/lib/firebase/admin';
import {
    Expense,
    GroupExpense,
    GiveTakeRecord,
    Stats,
    Organization
} from '@/types';
import { cacheTag } from 'next/cache';

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
// Expenses (Organization)
// =======================

export const getExpenses = async (orgId: string): Promise<Expense[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('expenses')
        .where('organizationId', '==', orgId)
        .withConverter(expenseConverter)
        .get();

    cacheTag(`expenses-org-${orgId}`, `stats-org-${orgId}`);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date,
    }));
};

// =======================
// Expenses (Group)
// =======================

export const getExpensesForGroup = async (groupId: string): Promise<Expense[]> => {
    if (!groupId) return [];

    const snapshot = await adminDb
        .collection('expenses')
        .where('groupId', '==', groupId)
        .withConverter(expenseConverter)
        .get();

    cacheTag(`expenses-group-${groupId}`);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date,
    }))
};

// =======================
// Groups
// =======================

export const getGroups = async (
    orgId: string
): Promise<GroupExpense[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('groups')
        .where('organizationId', '==', orgId)
        .withConverter(groupConverter)
        .get();

    cacheTag(`groups-org-${orgId}`);

    return snapshot.docs.map(doc => doc.data());
};

// =======================
// Give / Take
// =======================

export const getGiveTakes = async (
    orgId: string
): Promise<GiveTakeRecord[]> => {
    if (!orgId) return [];

    const snapshot = await adminDb
        .collection('give_takes')
        .where('organizationId', '==', orgId)
        .withConverter(giveTakeConverter)
        .get();

    cacheTag(`give-take-org-${orgId}`, `stats-org-${orgId}`);
    return snapshot.docs.map(doc => doc.data());
};

// =======================
// Stats
// =======================

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

    const expenses = expensesSnap.docs.map(
        d => d.data() as Expense
    );
    const giveTakes = giveTakeSnap.docs.map(
        d => d.data() as GiveTakeRecord
    );

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

    cacheTag(`stats-org-${orgId}`);
    return {
        currentBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        pendingToGive,
        pendingToTake,
    };
};

// =======================
// Single Group
// =======================

export const getGroupDetails = async (
    groupId: string
): Promise<GroupExpense | null> => {
    if (!groupId) return null;

    const doc = await adminDb
        .collection('groups')
        .doc(groupId)
        .withConverter(groupConverter)
        .get();

    cacheTag(`group-${groupId}`);
    return doc.exists ? doc.data() ?? null : null;
};

// =======================
// Organizations
// =======================

export const getUserOrganizations = async (
    userId: string
): Promise<Organization[]> => {
    if (!userId) return [];

    const snapshot = await adminDb
        .collection('organizations')
        .where('ownerId', '==', userId)
        .get();

    cacheTag(`orgs-user-${userId}`);
    return snapshot.docs.map(
        doc => ({ id: doc.id, ...doc.data() } as Organization)
    );
};
