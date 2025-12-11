"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

import dateRangeReducer from "./dateSlice";
import userReducer from "./userSlice";
import jobsReducer from "./jobsSlice";

const rootReducer = combineReducers({
    dateRange: dateRangeReducer,
    user: userReducer,
    jobs: jobsReducer,
});

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["dateRange", "user", "jobs"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
