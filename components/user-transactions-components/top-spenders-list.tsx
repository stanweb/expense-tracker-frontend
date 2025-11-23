'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSelector } from 'react-redux';
import { RootState, TopSpender, Category } from '@/Interfaces/Interfaces'; // Import Category interface
import { useEffect, useState } from 'react';
import axioClient from '@/utils/axioClient';

export function TopSpendersList() {
    const { fromDate, toDate, transactionType } = useSelector((state: RootState) => state.dateRange);
    const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // State for categories
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined); // State for selected category filter
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axioClient.get<Category[]>('/users/1/categories');
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        void fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTopSpenders = async () => {
            setLoading(true);
            setError(null);
            try {
                let typeParam = '';
                if (transactionType === 'spent') {
                    typeParam = 'paid,sent';
                } else if (transactionType === 'received') {
                    typeParam = 'received';
                }

                const params: any = {
                    from: fromDate ?? '',
                    to: toDate ?? '',
                    ...(typeParam && { type: typeParam }),
                    limit: 10, // Default to top 5, can be made dynamic later
                };

                if (selectedCategoryId && selectedCategoryId !== 'all') {
                    params.categoryId = [selectedCategoryId]; // API expects a list of category IDs
                }

                const response = await axioClient.get<TopSpender[]>('/users/1/transactions/top-spenders', {
                    params,
                });
                setTopSpenders(response.data);
            } catch (err: any) {
                console.error("Error fetching top spenders:", err);
                setError(err.message || 'Failed to fetch top spenders');
                setTopSpenders([]);
            } finally {
                setLoading(false);
            }
        };

        if (fromDate && toDate) {
            void fetchTopSpenders();
        }
    }, [fromDate, toDate, transactionType, selectedCategoryId]); // Add selectedCategoryId to dependencies

    const totalSpent = topSpenders.reduce((acc, spender) => acc + spender.totalSpent, 0);

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Top Spenders</CardTitle>
                    <CardDescription>Who you're spending the most money with</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="category-filter">Category:</Label>
                    <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {loading && <p>Loading top spenders...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {!loading && !error && topSpenders.length === 0 && (
                    <p>No top spenders found for the selected period and category.</p>
                )}
                {!loading && !error && topSpenders.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Recipient</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topSpenders.map((spender, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{spender.recipient}</TableCell>
                                    <TableCell className="text-right">KES {spender.totalSpent.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">KES {totalSpent.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
