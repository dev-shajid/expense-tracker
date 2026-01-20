export type TransactionType = 'income' | 'expense';
export type GiveTakeType = 'give' | 'take';
export type TransactionStatus = 'pending' | 'partially_settled' | 'settled';

export interface Organization {
    id: string;
    name: string;
    currency: string;
    ownerId: string;
    isPersonal?: boolean;
    createdAt?: string; // ISO timestamp
}

export interface Expense {
    id: string;
    amount: number;
    category: string;
    date: string; // ISO String
    notes?: string;
    organizationId: string;
    type: TransactionType;
    groupId?: string;
}

export interface GroupExpense {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    totalAmount: number;
    items: Expense[];
    organizationId: string;
}

export interface GiveTakeRecord {
    id: string;
    personName: string;
    amount: number;
    type: GiveTakeType;
    dueDate?: string;
    status: TransactionStatus;
    notes?: string;
    organizationId: string;
    createdAt: string;
    settledAmount: number; // For partial settlements
}

export interface Stats {
    currentBalance: number;
    totalIncome: number;
    totalExpense: number;
    pendingToGive: number;
    pendingToTake: number;
}
