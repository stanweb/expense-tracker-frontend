import { createAsyncThunk } from '@reduxjs/toolkit';
import { setRange } from './dateSlice';
import { fetchTransactions } from './transactionSlice';
import { fetchOverviewData } from './overviewSlice';
import { subDays } from 'date-fns';

export const updateDateRangeAndFetchData = createAsyncThunk(
  'data/updateDateRangeAndFetch',
  async (dateRange: { from?: string | null; to?: string | null } | null, { dispatch }) => {
    let fromDate: string;
    let toDate: string;

    if (dateRange && dateRange.from && dateRange.to) {
      fromDate = dateRange.from;
      toDate = dateRange.to;
    } else {
      // Default to the last 30 days
      const to = new Date();
      const from = subDays(to, 30);
      fromDate = from.toISOString();
      toDate = to.toISOString();
    }

    dispatch(setRange({ fromDate, toDate }));
    await Promise.all([
      dispatch(fetchTransactions({ from: fromDate, to: toDate })),
      dispatch(fetchOverviewData({ from: fromDate, to: toDate })),
    ]);
  }
);
