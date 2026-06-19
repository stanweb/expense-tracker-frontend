'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react';
import axioClient from '@/utils/apiClient';
import { TrendData } from '@/Interfaces/Interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/Interfaces/Interfaces';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Inbox } from 'lucide-react';

const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n);

export function TrendChart() {
    const { fromDate, toDate, transactionType, transactionTrigger } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchTrendData = async () => {
            setLoading(true);
            setError(null);
            try {
                let typeParam = '';
                if (transactionType === 'spent') {
                    typeParam = 'paid,sent';
                } else if (transactionType === 'received') {
                    typeParam = 'received';
                }

                const response = await axioClient.get<TrendData[]>(`/users/${userId}/analytics/spending-trend`, {
                    params: {
                        from: fromDate ?? '',
                        to: toDate ?? '',
                        ...(typeParam && { type: typeParam }),
                    },
                });
                setTrendData(response.data);
            } catch (err: any) {
                console.error("Error fetching trend data:", err);
                setError(err.message || 'Failed to fetch trend data');
                setTrendData([]);
            } finally {
                setLoading(false);
            }
        };
        void fetchTrendData();

    }, [fromDate, toDate, transactionType, userId, transactionTrigger]);

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col min-h-[280px] max-h-[420px]">
                {loading && (
                    <div className="space-y-3" aria-busy="true" aria-label="Loading trend data">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-[220px] w-full" />
                    </div>
                )}
                {error && (
                    <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                )}
                {!loading && !error && trendData.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                        <Inbox className="h-8 w-8 opacity-50" />
                        <p className="text-sm">No trend data found for the selected period.</p>
                        <p className="text-xs">Try widening the date range or check back after more transactions come in.</p>
                    </div>
                )}
                {!loading && !error && trendData.length > 0 && (
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="week"
                                    stroke="var(--color-foreground)"
                                    opacity={0.6}
                                    tick={{ fontSize: 11 }}
                                    tickMargin={6}
                                />
                                <YAxis
                                    stroke="var(--color-foreground)"
                                    opacity={0.6}
                                    width={48}
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v: number) => formatCurrency(v)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend
                                    iconType="line"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spending"
                                    name="Actual"
                                    stroke="var(--color-chart-1)"
                                    strokeWidth={2}
                                    dot={{ fill: 'var(--color-chart-1)', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    name="Forecast"
                                    stroke="var(--color-muted-foreground)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ fill: 'var(--color-muted-foreground)', r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
