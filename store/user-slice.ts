import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userId: number | null;
    username: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null; // Time until access token expires (in seconds)
    refreshExpiresIn: number | null; // Time until refresh token expires (in seconds)
    onboardingCompleted: boolean | null;
}

const initialState: UserState = {
    userId: null,
    username: null,
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
    refreshExpiresIn: null,
    onboardingCompleted: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setAuthTokens: (
            state,
            action: PayloadAction<{
                userId: number;
                username: string;
                accessToken: string;
                refreshToken: string;
                expiresIn: number;
                refreshExpiresIn: number;
                onboardingCompleted: boolean;
            }>
        ) => {
            state.userId = action.payload.userId;
            state.username = action.payload.username;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.expiresIn = action.payload.expiresIn;
            state.refreshExpiresIn = action.payload.refreshExpiresIn;
            state.onboardingCompleted = action.payload.onboardingCompleted;
        },
        clearUser: (state) => {
            state.userId = null;
            state.username = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.expiresIn = null;
            state.refreshExpiresIn = null;
            state.onboardingCompleted = null;
        },
        setAccessToken: (state, action: PayloadAction<{ accessToken: string; expiresIn: number }>) => {
            state.accessToken = action.payload.accessToken;
            state.expiresIn = action.payload.expiresIn;
        },
        setRefreshToken: (state, action: PayloadAction<{ refreshToken: string; refreshExpiresIn: number }>) => {
            state.refreshToken = action.payload.refreshToken;
            state.refreshExpiresIn = action.payload.refreshExpiresIn;
        },
    },
});

export const { setAuthTokens, clearUser, setAccessToken, setRefreshToken } = userSlice.actions;
export default userSlice.reducer;
