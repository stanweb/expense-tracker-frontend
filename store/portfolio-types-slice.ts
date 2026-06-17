import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PortfolioType } from "@/Interfaces/Interfaces";

interface PortfolioTypesState {
    items: PortfolioType[];
    loaded: boolean;
}

const initialState: PortfolioTypesState = {
    items: [],
    loaded: false,
};

const portfolioTypesSlice = createSlice({
    name: "portfolioTypes",
    initialState,
    reducers: {
        setPortfolioTypes(state, action: PayloadAction<PortfolioType[]>) {
            state.items = action.payload;
            state.loaded = true;
        },
        upsertPortfolioType(state, action: PayloadAction<PortfolioType>) {
            const idx = state.items.findIndex((t) => t.id === action.payload.id);
            if (idx >= 0) state.items[idx] = action.payload;
            else state.items.push(action.payload);
        },
        removePortfolioType(state, action: PayloadAction<number>) {
            state.items = state.items.filter((t) => t.id !== action.payload);
        },
    },
});

export const { setPortfolioTypes, upsertPortfolioType, removePortfolioType } =
    portfolioTypesSlice.actions;

export default portfolioTypesSlice.reducer;