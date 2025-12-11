'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axiosClient from "../utils/axioClient"
import {useEffect, useState} from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Category } from '@/Interfaces/Interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export function SpendingChart() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 'all' or categoryId
    const userId = useSelector((state: RootState) => state.user.userId);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => String(currentYear + 1 - i));

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

    if (!userId) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Please log in to view your spending data.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No user data available.</p>
                </CardContent>
            </Card>
        );
    }
    
    if (loading) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Monthly spending vs budget comparison</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        );
    }

    const noDataMessage = `No spending data available for ${selectedCategory === 'all' ? 'all categories' : categories.find(c => String(c.id) === selectedCategory)?.name || 'selected category'} in ${selectedYear}.`;

    if (error || chartData.length === 0) {
        return (
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Spending Overview</CardTitle>
                        <CardDescription>Monthly spending vs budget comparison</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div>
                            <Label htmlFor="year-filter">Year</Label>
                            <Select onValueChange={setSelectedYear} value={selectedYear}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="category-filter">Category</Label>
                            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">{noDataMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Monthly spending vs budget comparison</CardDescription>
                </div>
                <div className="flex gap-2">
                    <div>
                        <Label htmlFor="year-filter">Year</Label>
                        <Select onValueChange={setSelectedYear} value={selectedYear}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="category-filter">Category</Label>
                        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-foreground)" opacity={0.6} />
                        <YAxis stroke="var(--color-foreground)" opacity={0.6} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px'
                            }}
                            cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="spent" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="budget" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
