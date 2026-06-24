'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TopSpendersTableSkeleton } from '@/components/user-transactions-components/top-spenders-table-skeleton';
import { CircleAlert, Inbox, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState, TopSpender, Category } from '@/Interfaces/Interfaces';
import { useEffect, useState } from 'react';
import axioClient from '@/utils/apiClient';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value);

export function TopSpendersList() {
    const { fromDate, toDate, transactionType } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchCategories = async () => {
            try {
                const response = await axioClient.get<Category[]>(`/users/${userId}/categories`);
                setCategories(response.data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        void fetchCategories();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
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
                    limit: 10,
                };

                if (selectedCategoryId && selectedCategoryId !== 'all') {
                    params.categoryId = [selectedCategoryId];
                }

                const response = await axioClient.get<TopSpender[]>(`/users/${userId}/analytics/top-spenders`, {
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
    }, [fromDate, toDate, transactionType, selectedCategoryId, userId]);

    const totalSpent = topSpenders.reduce((acc, spender) => acc + spender.totalSpent, 0);
    const hasActiveFilter = selectedCategoryId && selectedCategoryId !== 'all';

    return (
        <Card className="bg-card">
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                        <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {loading && <TopSpendersTableSkeleton count={5} />}

                {error && !loading && (
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>Couldn’t load top spenders</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && topSpenders.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div className="rounded-full bg-muted p-3">
                            <Inbox className="size-6 text-muted-foreground" aria-hidden />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">No top spenders yet</p>
                            <p className="text-sm text-muted-foreground">
                                {hasActiveFilter
                                    ? 'Try a different category or widen your date range.'
                                    : 'No transactions match the current filters.'}
                            </p>
                        </div>
                    </div>
                )}

                {!loading && !error && topSpenders.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Recipient</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topSpenders.map((spender, index) => (
                                <TableRow key={`${spender.recipient}-${index}`}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {index === 0 && (
                                                <TrendingUp className="size-4 text-primary" aria-hidden />
                                            )}
                                            {spender.recipient}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {formatCurrency(spender.totalSpent)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2} className="text-muted-foreground">Total</TableCell>
                                <TableCell className="text-right font-semibold tabular-nums">
                                    {formatCurrency(totalSpent)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
