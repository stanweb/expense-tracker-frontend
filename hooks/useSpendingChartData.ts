import { useState, useEffect } from 'react';
import axiosClient from '../utils/servicesAxiosClient';
import { Category } from '@/Interfaces/Interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function useSpendingChartData(selectedYear: string, selectedCategory: string) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const userId = useSelector((state: RootState) => state.user.userId);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!userId) return;
            try {
                const response = await axiosClient.get<Category[]>(`users/${userId}/categories`);
                setCategories(response.data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        void fetchCategories();
    }, [userId]);

    useEffect(() => {
        const fetchChartData = async () => {
            if (!userId) return;
            setLoading(true);
            setError(null);
            try {
                const params: { year: string; categoryId?: string } = { year: selectedYear };
                if (selectedCategory !== 'all') {
                    params.categoryId = selectedCategory;
                }
                const response = await axiosClient.get(`users/${userId}/monthly/breakdown`, { params });
                setChartData(response.data);
            } catch (err: any) {
                console.error("Error fetching chart data:", err);
                setError(err.message || "Failed to fetch chart data");
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };
        void fetchChartData();
    }, [selectedYear, selectedCategory, userId]);

    return { chartData, loading, error, categories, userId };
}
