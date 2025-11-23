import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppDateRangeState {
    fromDate: string | null;
    toDate: string | null;
    transactionType: 'all' | 'spent' | 'received';
}

const initialState: AppDateRangeState = {
  fromDate: null,
  toDate: null,
  transactionType: 'all',
};

const dateRangeSlice = createSlice({
  name: "dateRange",
  initialState,
  reducers: {
    setRange(
      state,
      action: PayloadAction<{ fromDate: string | null; toDate: string | null; transactionType?: 'all' | 'spent' | 'received' }>
    ) {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
      if (action.payload.transactionType !== undefined) {
        state.transactionType = action.payload.transactionType;
      }
    },
  },
});

export const { setRange } =
  dateRangeSlice.actions;

export default dateRangeSlice.reducer;
