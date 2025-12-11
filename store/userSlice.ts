import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userId: number | null;
    username: string | null;
}

const initialState: UserState = {
    userId: null,
    username: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ userId: number; username: string }>) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
        },
        clearUser: (state) => {
            state.userId = null;
            state.username = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
