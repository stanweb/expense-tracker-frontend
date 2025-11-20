import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Transaction {
    id: number | null;
    amount: number;
    transaction_cost: number;
    date: string;
    recipient: string | null;
    type: "expense" | "income";
}

interface TransactionsState {
    items: Transaction[];
}

const initialState: TransactionsState = {
    items: [],
};

const transactionsSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        addTransaction(state, action: PayloadAction<Transaction>) {
            state.items.push(action.payload);
        },
        setTransactions(state, action: PayloadAction<Transaction[]>) {
            state.items = action.payload;
        },
        clearTransactions(state) {
            state.items = [];
        },
    },
});

export const { addTransaction, setTransactions, clearTransactions } =
    transactionsSlice.actions;

export default transactionsSlice.reducer;
