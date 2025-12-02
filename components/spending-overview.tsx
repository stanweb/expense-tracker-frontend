'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Wallet, Tag, ArrowUpRight } from 'lucide-react'
import { useSelector } from "react-redux";
import { RootState, OverviewData } from "@/Interfaces/Interfaces";
import { ActiveCategoryItem } from "@/components/active-category-item";
import { useEffect, useState } from 'react';
import axiosClient from '@/utils/axioClient';

export function SpendingOverview() {
    const { transactionType, fromDate, toDate } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalSpentLabel = transactionType === 'received' ? 'Total Received' : 'Total Spent';

    useEffect(() => {
        if (!userId) return;
        const fetchSpendingData = async () => {
            setLoading(true);
            setError(null);
            try {
                let typeParam = '';
                if (transactionType === 'spent') {
                    typeParam = 'paid,sent';
                } else if (transactionType === 'received') {
                    typeParam = 'received';
                }

                const response = await axiosClient.get(`/users/${userId}/summary-overview`, {
                    params: {
                        from: fromDate,
                        to: toDate,
                        ...(typeParam && { type: typeParam }),
                    },
                });
                setData(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        if (fromDate && toDate) {
            fetchSpendingData();
        }
    }, [fromDate, toDate, transactionType, userId]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="bg-card">
                        <CardContent className="pt-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/3"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error || !data || (data.totalSpent === 0 && data.transactionCost === 0 && data.categoriesCount === 0 && data.transactionsCount === 0)) {
        return (
            <div className="col-span-full text-center py-8 text-muted-foreground">
                <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-destructive font-medium">No data available for the selected period</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Please select a different date range or add some transactions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const metrics = [
        {
            label: totalSpentLabel,
            value: `KES ${(data.totalSpent / 1000).toFixed(1)}k`,
            icon: Wallet,
            color: 'from-primary/20 to-primary/5',
            trend: '+12.5%',
            trendUp: true,
        },
        {
            label: 'Transaction Costs',
            value: `KES ${data.transactionCost.toFixed(2)}`,
            icon: ArrowUpRight,
            color: 'from-chart-1/20 to-chart-1/5',
            trend: '+3.2%',
            trendUp: false,
        },
        {
            label: 'Categories',
            value: data.categoriesCount.toString(),
            icon: Tag,
            color: 'from-chart-2/20 to-chart-2/5',
            trend: 'Active',
            trendUp: true,
        },
        {
            label: 'Total Transactions',
            value: data.transactionsCount.toString(),
            icon: TrendingUp,
            color: 'from-chart-3/20 to-chart-3/5',
            trend: '+23 this month',
            trendUp: true,
        },
    ]

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <ActiveCategoryItem
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        icon={metric.icon}
                        color={metric.color}
                        trend={metric.trend}
                        trendUp={metric.trendUp}
                    />
                ))}
            </div>
        </div>
    )
}
