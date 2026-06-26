import {
    InvestmentTransaction,
    InvestmentTransactionQuery,
    InvestmentTransactionType,
} from "@/Interfaces/Interfaces";
import axiosClient from "@/utils/apiClient";

export type InvestmentTransactionPayload = {
    portfolioId: number;
    tickerSymbol?: string;
    type: InvestmentTransactionType;
    units?: number | string | null;
    amount: number | string;
    pricePerUnit?: number | string | null;
    transactionDate?: string | null;
    notes?: string | null;
};

const buildQueryString = (params?: InvestmentTransactionQuery): string => {
    if (!params) return "";
    const search = new URLSearchParams();
    if (params.portfolioId !== undefined) search.set("portfolioId", String(params.portfolioId));
    if (params.type) search.set("type", params.type);
    if (params.fromDate) search.set("fromDate", params.fromDate);
    if (params.toDate) search.set("toDate", params.toDate);
    if (params.page !== undefined) search.set("page", String(params.page));
    if (params.size !== undefined) search.set("size", String(params.size));
    if (params.sort) search.set("sort", params.sort);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
};

export const getInvestmentTransactions = async (
    userId: number,
    params?: InvestmentTransactionQuery
): Promise<InvestmentTransaction[]> => {
    try {
        const response = await axiosClient.get<InvestmentTransaction[]>(
            `users/${userId}/investment-transactions${buildQueryString(params)}`
        );
        return response.data || [];
    } catch (err) {
        console.error("Error fetching investment transactions:", err);
        return [];
    }
};

export const createInvestmentTransaction = async (
    userId: number,
    payload: InvestmentTransactionPayload
): Promise<InvestmentTransaction> => {
    const response = await axiosClient.post<InvestmentTransaction>(
        `users/${userId}/investment-transactions`,
        payload
    );
    return response.data;
};

export const bulkCreateInvestmentTransactions = async (
    userId: number,
    payloads: InvestmentTransactionPayload[]
): Promise<InvestmentTransaction[]> => {
    const response = await axiosClient.post<InvestmentTransaction[]>(
        `users/${userId}/investment-transactions/bulk`,
        payloads
    );
    return response.data;
};

export const updateInvestmentTransaction = async (
    userId: number,
    transactionId: string,
    payload: InvestmentTransactionPayload
): Promise<InvestmentTransaction> => {
    const response = await axiosClient.put<InvestmentTransaction>(
        `users/${userId}/investment-transactions/${transactionId}`,
        payload
    );
    return response.data;
};

export const deleteInvestmentTransaction = async (
    userId: number,
    transactionId: string
): Promise<void> => {
    await axiosClient.delete(`users/${userId}/investment-transactions/${transactionId}`);
};