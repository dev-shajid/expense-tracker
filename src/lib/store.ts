
import { Expense, GiveTakeRecord, GroupExpense, Organization, Stats } from '@/types';

// Mock Data
export const MOCK_ORGS: Organization[] = [
    { id: 'org_1', name: 'Personal', isPersonal: true, currency: 'USD', ownerId: 'user_1' },
    { id: 'org_2', name: 'Family', currency: 'USD', ownerId: 'user_1' },
    { id: 'org_3', name: 'Business', currency: 'USD', ownerId: 'user_1' },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'exp_1', amount: 45.50, category: 'Food', date: '2025-01-15T12:00:00Z', notes: 'Lunch with friends', organizationId: 'org_1', type: 'expense' },
    { id: 'exp_2', amount: 12.00, category: 'Transport', date: '2025-01-16T09:30:00Z', notes: 'Uber to work', organizationId: 'org_1', type: 'expense' },
    { id: 'exp_3', amount: 1200.00, category: 'Rent', date: '2025-01-01T00:00:00Z', notes: 'January Rent', organizationId: 'org_1', type: 'expense' },
    { id: 'exp_4', amount: 3500.00, category: 'Salary', date: '2025-01-01T00:00:00Z', notes: 'January Salary', organizationId: 'org_1', type: 'income' },
    { id: 'exp_5', amount: 150.00, category: 'Groceries', date: '2025-01-10T18:00:00Z', notes: 'Weekly groceries', organizationId: 'org_2', type: 'expense' },
    // Group Expenses
    { id: 'exp_6', amount: 300.00, category: 'Travel', date: '2025-01-12T14:00:00Z', notes: 'Hotel Booking', organizationId: 'org_1', type: 'expense', groupId: 'grp_1' },
    { id: 'exp_7', amount: 150.00, category: 'Food', date: '2025-01-13T20:00:00Z', notes: 'Group Dinner', organizationId: 'org_1', type: 'expense', groupId: 'grp_1' },
];

export const MOCK_GIVE_TAKE: GiveTakeRecord[] = [
    { id: 'gt_1', personName: 'John Doe', amount: 50.00, type: 'take', dueDate: '2025-02-01T00:00:00Z', status: 'pending', organizationId: 'org_1', createdAt: '2025-01-10T00:00:00Z', settledAmount: 0 },
    { id: 'gt_2', personName: 'Alice Smith', amount: 200.00, type: 'give', dueDate: '2025-01-20T00:00:00Z', status: 'partially_settled', organizationId: 'org_1', createdAt: '2025-01-05T00:00:00Z', settledAmount: 50 },
];

export const MOCK_GROUPS: GroupExpense[] = [
    {
        id: 'grp_1',
        title: 'Weekend Trip',
        description: 'Trip to the mountains',
        startDate: '2025-01-12T00:00:00Z',
        endDate: '2025-01-14T00:00:00Z',
        totalAmount: 450.00,
        organizationId: 'org_1',
        items: [
            { id: 'exp_6', amount: 300.00, category: 'Travel', date: '2025-01-12T14:00:00Z', notes: 'Hotel Booking', organizationId: 'org_1', type: 'expense' },
            { id: 'exp_7', amount: 150.00, category: 'Food', date: '2025-01-13T20:00:00Z', notes: 'Group Dinner', organizationId: 'org_1', type: 'expense' },
        ]
    }
];

// Helper functions to simulate data fetching/manipulation
export const getOrgStats = (orgId: string): Stats => {
    const orgExpenses = MOCK_EXPENSES.filter(e => e.organizationId === orgId);
    const orgGiveTake = MOCK_GIVE_TAKE.filter(e => e.organizationId === orgId);

    const totalIncome = orgExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = orgExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

    const pendingToGive = orgGiveTake
        .filter(e => e.type === 'give' && e.status !== 'settled')
        .reduce((sum, e) => sum + (e.amount - e.settledAmount), 0);

    const pendingToTake = orgGiveTake
        .filter(e => e.type === 'take' && e.status !== 'settled')
        .reduce((sum, e) => sum + (e.amount - e.settledAmount), 0);

    return {
        currentBalance: totalIncome - totalExpense,
        totalIncome,
        totalExpense,
        pendingToGive,
        pendingToTake
    };
};

export const formatCurrency = (amount: number, currency: string = 'BDT') => {
    return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency,
    }).format(amount);
};
