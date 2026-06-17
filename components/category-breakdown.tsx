'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState } from "react";
import axioClient from "@/utils/apiClient";
import {COLORS} from "../utils/constants"
import { useSelector } from "react-redux";
import { RootState } from "@/Interfaces/Interfaces";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Inbox } from 'lucide-react';

interface CategoryDatum {
    name: string;
    value: number;
}

export function CategoryBreakdown() {
    const { fromDate, toDate, transactionTrigger } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [categoryData, setCategoryData] = useState<CategoryDatum[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        axioClient.get(`users/${userId}/analytics/categories`, {
            params: {
                startDate: fromDate,
                endDate: toDate
            }
        })
            .then((res) => {
                const data: CategoryDatum[] = res.data;
                const top = [...data].sort((a, b) => b.value - a.value);
                const mainCategories = top.slice(0, 4);
                const otherValue = top
                    .slice(4)
                    .reduce((acc, item) => acc + item.value, 0);

                if (otherValue > 0) {
                    setCategoryData([...mainCategories, { name: 'Others', value: otherValue }]);
                } else {
                    setCategoryData(mainCategories);
                }
            })
            .catch((err) => {
                console.error(err);
                setError(err?.response?.data?.message || err.message || 'Failed to load category data');
                setCategoryData([]);
            })
            .finally(() => setLoading(false));
    }, [fromDate, toDate, userId, transactionTrigger])

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Spending breakdown by category</CardDescription>
                </div>
                <CardAction>
                    <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                        <Link href="/top-spenders">View top spenders</Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="min-h-[300px]">
                {loading && (
                    <div className="space-y-3" aria-busy="true" aria-label="Loading category data">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-[260px] w-full rounded-full" />
                    </div>
                )}
                {error && (
                    <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                )}
                {!loading && !error && categoryData.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Inbox className="h-10 w-10 text-muted-foreground/50" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">No category data for this period.</p>
                            <p className="text-xs text-muted-foreground">Try widening the date range, or add transactions to see the breakdown.</p>
                        </div>
                    </div>
                )}
                {!loading && !error && categoryData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => value >= 8 ? `${name}: ${value.toFixed(0)}%` : ''}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
