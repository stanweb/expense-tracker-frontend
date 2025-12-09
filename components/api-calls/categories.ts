import { Category } from '@/Interfaces/Interfaces';
import axiosClient from '@/utils/axioClient';

export const getCategories = async (userId: number): Promise<Category[]> => {
    try {
        const response = await axiosClient.get<Category[]>(`users/${userId}/categories`);
        return response.data || [];
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
};
