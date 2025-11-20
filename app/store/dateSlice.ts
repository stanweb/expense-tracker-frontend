import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface DateRangeState {
  fromDate: string | null;
  toDate: string | null;
}

const initialState: DateRangeState = {
  fromDate: null,
  toDate: null,
};

const dateRangeSlice = createSlice({
  name: "dateRange",
  initialState,
  reducers: {
    setFromDate(state, action: PayloadAction<string | null>) {
      state.fromDate = action.payload;
    },
    setToDate(state, action: PayloadAction<string | null>) {
      state.toDate = action.payload;
    },
    setRange(
      state,
      action: PayloadAction<{ fromDate: string | null; toDate: string | null }>
    ) {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
    },
    resetRange(state) {
      state.fromDate = null;
      state.toDate = null;
    },
  },
});

export const { setFromDate, setToDate, setRange, resetRange } =
  dateRangeSlice.actions;

export default dateRangeSlice.reducer;
