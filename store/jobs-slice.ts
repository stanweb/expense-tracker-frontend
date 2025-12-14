"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Job {
    jobId: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
}

// Slice state is now directly an array of jobs
const initialState: Job[] = [];

const jobsSlice = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        addJob: (state, action: PayloadAction<Job>) => {
            state.push(action.payload);
        },

        updateJobStatus: (
            state,
            action: PayloadAction<{ id: string; status: Job["status"] }>
        ) => {
            const job = state.find(j => j.jobId === action.payload.id);
            if (job) {
                job.status = action.payload.status;
            }
        },

        clearJob: () => {
            return [];
        }
    }
});

export const { addJob, updateJobStatus, clearJob } = jobsSlice.actions;
export default jobsSlice.reducer;
