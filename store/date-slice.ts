import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {AppDateRangeState} from "@/Interfaces/Interfaces";

// export interface AppDateRangeState {
//     fromDate: string | null;
//     toDate: string | null;
//     transactionType: 'all' | 'spent' | 'received';
//     transactionTrigger: string | null;       // <- added
// }

const initialState: AppDateRangeState = {
    fromDate: null,
    toDate: null,
    transactionType: 'all',
    transactionTrigger: null
};

const dateRangeSlice = createSlice({
    name: "dateRange",
    initialState,
    reducers: {
        setRange(
            state,
            action: PayloadAction<{
                fromDate: string | null;
                toDate: string | null;
                transactionType?: 'all' | 'spent' | 'received';
                transactionTrigger?: string;       // <- optional trigger passed in
            }>
        ) {
            state.fromDate = action.payload.fromDate;
            state.toDate = action.payload.toDate;

            if (action.payload.transactionType !== undefined) {
                state.transactionType = action.payload.transactionType;
            }

            if (action.payload.transactionTrigger !== undefined) {
                state.transactionTrigger = action.payload.transactionTrigger;
            }
        },

        // ↳ Dedicated trigger update action
        setTransactionTrigger(state, action: PayloadAction<string>) {
            state.transactionTrigger = action.payload;
        }
    },
});

export const { setRange, setTransactionTrigger } = dateRangeSlice.actions;

export default dateRangeSlice.reducer;
