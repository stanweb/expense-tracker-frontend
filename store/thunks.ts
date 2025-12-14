import { createAsyncThunk } from '@reduxjs/toolkit';
import { setRange } from './date-slice';
import { subDays } from 'date-fns';

export const updateDateRangeAndFetchData = createAsyncThunk(
  'data/updateDateRangeAndFetch',
  async (
    params: {
      from?: string | null;
      to?: string | null;
      transactionType?: 'all' | 'spent' | 'received';
    } | null,
    { dispatch }
  ) => {
    let fromDate: string;
    let toDate: string;
    const transactionType = params?.transactionType || 'all';

    if (params && params.from && params.to) {
      fromDate = params.from;
      toDate = params.to;
    } else {
      // Default to the last 30 days
      const to = new Date();
      const from = subDays(to, 30);
      fromDate = from.toISOString();
      toDate = to.toISOString();
    }

    dispatch(setRange({ fromDate, toDate, transactionType }));
  }
);
