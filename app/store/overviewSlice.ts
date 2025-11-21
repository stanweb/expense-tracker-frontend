import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '@/utils/axioClient';
import { OverviewData } from '@/Interfaces/Interfaces';

interface OverviewState {
  data: OverviewData | null;
  loading: boolean;
  error: string | null;
}

const initialState: OverviewState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchOverviewData = createAsyncThunk(
  'overview/fetchData',
  async (params: { from: string; to: string }) => {
    const response = await axiosClient.get('/users/1/summary-overview', { params });
    return response.data;
  }
);

const overviewSlice = createSlice({
  name: 'overview',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverviewData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOverviewData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch overview data';
      });
  },
});

export default overviewSlice.reducer;
