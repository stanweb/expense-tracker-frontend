export interface ParsedTransaction {
    transactionId: string | null;
    amount: number;
    transactionCost: number;
    date: string; // ISO datetime string
    recipient: string | null;
    type: "expense" | "income";
    rawMessage: string;
}


export interface RootState {
    transactions: Transactions;
    dateRange: DateRange;
}


interface Transactions {
    items: any[];
}

interface DateRange {
    fromDate: string; // ISO string
    toDate: string;   // ISO string
}
