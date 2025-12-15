import { Category } from '@/Interfaces/Interfaces';
import axiosClient from '@/utils/servicesAxiosClient';

export const getCategories = async (userId: number): Promise<Category[]> => {
    try {
        const response = await axiosClient.get<Category[]>(`users/${userId}/categories`);
        return response.data || [];
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
};

export const addCategory = async (userId: number, category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await axiosClient.post<Category>(`users/${userId}/categories`, category);
    return response.data;
};

export const addCategories = async (
    userId: number,
    categories: Array<Omit<Category, "id">>
): Promise<Category[]> => {
    const response = await axiosClient.post<Category[]>(
        `users/${userId}/categories/bulk`,
        categories
    );
    return response.data;
};
