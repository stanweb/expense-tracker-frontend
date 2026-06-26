import { ElementType } from "react";

export interface ParsedTransaction {
    transactionId: string | null;
    amount: number;
    transactionCost: number;
    date: string; // ISO datetime string
    recipient: string | null;
    type: "sent" | "received" | "paid" | "";
    rawMessage: string;
}

export interface AddTransaction {
    transactionId: string;
    amount: number;
    transactionCost: number;
    date: string;
    recipient: string;
    type: string;
    rawMessage: string;
    categoryId: number;

}

export interface OverviewData {
    totalSpent: number;
    transactionCost: number;
    categoriesCount: number;
    transactionsCount: number;
}

export interface User {
    username: string;
    userId: number;
    onboardingCompleted: boolean;
}

export interface JobState {
    jobId: string | null;
    status: string | null;
  }

  export interface RootState {
      dateRange: AppDateRangeState;
      user: User;
      jobs: JobState [];
      portfolioTypes: PortfolioTypesState;
  }

export interface PortfolioTypesState {
    items: PortfolioType[];
    loaded: boolean;
}
  

export interface AppDateRangeState {
    fromDate: string | null; // ISO string
    toDate: string | null;   // ISO string
    transactionType: 'all' | 'spent' | 'received';
    transactionTrigger: string | null;       // <- added
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
    rawDate?: string // ISO date from API; used for full-date display on the dashboard.
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
    totalSpent?: number;
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

export interface Portfolio {
    id: number;
    userId: number;
    name: string;
    tickerSymbol: string;
    broker: string | null;
    totalUnits: string;
    totalCostBasis: string;
    currentValue: string;
    typeId?: number | null;
    typeName?: string | null;
    typeActive?: boolean | null;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioType {
    id: number;
    name: string;
    description: string | null;
    active: boolean;
}

export type InvestmentTransactionType = "BUY" | "SELL" | "INTEREST";

export interface InvestmentTransaction {
    id: string;
    userId: number;
    portfolioId: number;
    portfolioName: string;
    tickerSymbol: string;
    type: InvestmentTransactionType;
    units: string | null;
    amount: string;
    pricePerUnit: string | null;
    transactionDate: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface InvestmentTransactionQuery {
    portfolioId?: number;
    type?: InvestmentTransactionType;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface PortfolioTypes{

}
