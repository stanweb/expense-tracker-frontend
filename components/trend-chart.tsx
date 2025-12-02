'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react';
import axioClient from '@/utils/axioClient';
import { TrendData } from '@/Interfaces/Interfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/Interfaces/Interfaces';

export function TrendChart() {
    const { fromDate, toDate, transactionType } = useSelector((state: RootState) => state.dateRange);
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

                const response = await axioClient.get<TrendData[]>(`/users/${userId}/transactions/trend`, {
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

        if (fromDate && toDate) {
            void fetchTrendData();
        }
    }, [fromDate, toDate, transactionType, userId]);

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Weekly spending vs forecast</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && <p>Loading trend data...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {!loading && !error && trendData.length === 0 && (
                    <p>No trend data found for the selected period.</p>
                )}
                {!loading && !error && trendData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="week" stroke="var(--color-foreground)" opacity={0.6} />
                            <YAxis stroke="var(--color-foreground)" opacity={0.6} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="spending"
                                stroke="var(--color-chart-1)"
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-chart-1)', r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="forecast"
                                stroke="var(--color-chart-2)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: 'var(--color-chart-2)', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
