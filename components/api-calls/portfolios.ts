import { Portfolio } from "@/Interfaces/Interfaces";
import axiosClient from "@/utils/apiClient";

export type PortfolioPayload = {
    name: string;
    tickerSymbol: string;
    broker?: string | null;
    totalUnits?: number | string | null;
    totalCostBasis?: number | string | null;
    currentValue?: number | string | null;
    typeId?: number | null;
};

export const getPortfolios = async (userId: number): Promise<Portfolio[]> => {
    try {
        const response = await axiosClient.get<Portfolio[]>(`users/${userId}/portfolios`);
        return response.data || [];
    } catch (err) {
        console.error("Error fetching portfolios:", err);
        return [];
    }
};

export const getPortfolio = async (userId: number, id: number): Promise<Portfolio> => {
    const response = await axiosClient.get<Portfolio>(`users/${userId}/portfolios/${id}`);
    return response.data;
};

export const createPortfolio = async (
    userId: number,
    payload: PortfolioPayload
): Promise<Portfolio> => {
    const response = await axiosClient.post<Portfolio>(`users/${userId}/portfolios`, payload);
    return response.data;
};

export const updatePortfolio = async (
    userId: number,
    id: number,
    payload: PortfolioPayload
): Promise<Portfolio> => {
    const response = await axiosClient.put<Portfolio>(`users/${userId}/portfolios/${id}`, payload);
    return response.data;
};

export const deletePortfolio = async (userId: number, id: number): Promise<void> => {
    await axiosClient.delete(`users/${userId}/portfolios/${id}`);
};