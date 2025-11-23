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
    dateRange: AppDateRangeState;
}

export interface AppDateRangeState {
    fromDate: string; // ISO string
    toDate: string;   // ISO string
    transactionType: 'all' | 'spent' | 'received';
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
    icon: ElementType
}

export interface Category {
    id: number;
    name: string;
    description: string;
    categoryIcon: string | null;
}

export interface Budget {
    id: number;
    amount: number;
    month: number;
    year: number;
    userId: number;
    categoryId: number;
    categoryName?: string;
}

export interface TopSpender {
    recipient: string;
    totalSpent: number;
}

export interface TrendData {
    week: string;
    spending: number;
    forecast: number;
}
