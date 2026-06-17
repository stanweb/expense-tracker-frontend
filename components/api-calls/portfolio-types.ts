import { PortfolioType } from "@/Interfaces/Interfaces";
import axiosClient from "@/utils/apiClient";

export type PortfolioTypePayload = {
    name: string;
    description?: string | null;
    active?: boolean;
};

export const getPortfolioTypes = async (userId: number): Promise<PortfolioType[]> => {
    try {
        const response = await axiosClient.get<PortfolioType[]>(
            `users/${userId}/portfolios/types`
        );
        return response.data || [];
    } catch (err) {
        console.error("Error fetching portfolio types:", err);
        return [];
    }
};

export const createPortfolioType = async (
    userId: number,
    payload: PortfolioTypePayload
): Promise<PortfolioType> => {
    const response = await axiosClient.post<PortfolioType>(
        `users/${userId}/portfolios/types`,
        payload
    );
    return response.data;
};

export const updatePortfolioType = async (
    userId: number,
    id: number,
    payload: PortfolioTypePayload
): Promise<PortfolioType> => {
    const response = await axiosClient.put<PortfolioType>(
        `users/${userId}/portfolios/types/${id}`,
        payload
    );
    return response.data;
};

export const deletePortfolioType = async (userId: number, id: number): Promise<void> => {
    await axiosClient.delete(`users/${userId}/portfolios/types/${id}`);
};