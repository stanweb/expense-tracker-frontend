import { ElementType } from "react";

export interface ParsedTransaction {
    transactionId: string | null;
    amount: number;
    transactionCost: number;
    date: string; // ISO datetime string
    recipient: string | null;
    type: "expense" | "income";
    rawMessage: string;
}

export interface OverviewData {
    totalSpent: number;
    transactionCost: number;
    categoriesCount: number;
    transactionsCount: number;
}

export interface RootState {
    transactions: TransactionsState;
    dateRange: DateRange;
    overview: OverviewState;
}

interface TransactionsState {
    items: UiTransaction[];
    loading: boolean;
    error: string | null;
}

interface OverviewState {
    data: OverviewData | null;
    loading: boolean;
    error: string | null;
}

interface DateRange {
    fromDate: string; // ISO string
    toDate: string;   // ISO string
}

export interface ApiTransaction {
    id: number
    amount: number
    date: string
    type: string
    categoryId: number
    recipient: string
    categoryName?: string
    categoryIcon: string
}

export interface UiTransaction {
    id: number
    name: string
    category?: string
    amount: number
    date: string // "Today", "Yesterday", etc.
    recipient?: string
    categoryName?: string
    icon: string
}

export interface Category {
    id: number;
    name: string;
    description: string;
    categoryIcon: string | null;
}
