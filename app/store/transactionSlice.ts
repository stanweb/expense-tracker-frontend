import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '@/utils/axioClient';
import { ApiTransaction, UiTransaction } from '@/Interfaces/Interfaces';
import { ElementType } from 'react';
import * as Icons from 'lucide-react';

interface TransactionsState {
  items: UiTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

// const getIcon = (categoryIcon: string): ElementType => {
//     if (categoryIcon && typeof categoryIcon === 'string') {
//         const IconComponent = Icons[categoryIcon as keyof typeof Icons];
//         if (IconComponent && (typeof IconComponent === 'function' || typeof IconComponent === 'object')) {
//             return IconComponent as ElementType;
//         }
//     }
//     return Icons.CreditCard; // Default icon
// }

const formatDaysAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
}

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchData',
  async (params: { from: string; to: string }) => {
      const response = await axiosClient.get('/users/1/transactions', { params });
      const data = response.data as ApiTransaction[];

      return data.map((t) => ({
        id: t.id,
        name: t.recipient,
        category: t.categoryName,
        amount: t.amount,
        icon: t.categoryIcon,
        date: formatDaysAgo(t.date),
    }));
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });
  },
});

export default transactionsSlice.reducer;
