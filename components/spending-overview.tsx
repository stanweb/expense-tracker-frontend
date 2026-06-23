'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Wallet, Tag, ArrowUpRight } from 'lucide-react'
import { useSelector } from "react-redux";
import { RootState, OverviewData } from "@/Interfaces/Interfaces";
import { ActiveCategoryItem } from "@/components/active-category-item";
import { useEffect, useState } from 'react';
import axiosClient from '@/utils/apiClient';

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    }).format(n);

export function SpendingOverview() {
    const { transactionType, fromDate, toDate, transactionTrigger } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(false);

    const effectiveType = transactionType === 'all' ? 'spent' : transactionType;
    const totalSpentLabel = effectiveType === 'received' ? 'Total Received' : 'Total Spent';

    useEffect(() => {
        if (!userId) return;
        const fetchSpendingData = async () => {
            setLoading(true);
            try {
                let typeParam = '';
                if (effectiveType === 'spent') {
                    typeParam = 'paid,sent';
                } else if (effectiveType === 'received') {
                    typeParam = 'received';
                }

                const response = await axiosClient.get(`/users/${userId}/analytics/summary`, {
                    params: {
                        from: fromDate,
                        to: toDate,
                        ...(typeParam && { type: typeParam }),
                    },
                });
                setData(response.data);
            } catch (err: any) {
                console.error(err.message || 'Failed to fetch data');
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchSpendingData().catch(console.error);
    }, [fromDate, toDate, effectiveType, userId, transactionTrigger]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

    if (!data) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="bg-card">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">No data available</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const metrics = [
        {
            label: totalSpentLabel,
            value: formatKES(data.totalSpent),
            icon: Wallet,
            color: 'bg-primary/10 text-primary',
        },
        {
            label: 'Transaction Costs',
            value: formatKES(data.transactionCost),
            icon: ArrowUpRight,
            color: 'bg-chart-1/15 text-chart-1',
        },
        {
            label: 'Categories',
            value: data.categoriesCount.toString(),
            icon: Tag,
            color: 'bg-chart-2/15 text-chart-2',
        },
        {
            label: 'Total Transactions',
            value: data.transactionsCount.toString(),
            icon: TrendingUp,
            color: 'bg-chart-3/15 text-chart-3',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
                <ActiveCategoryItem
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    color={metric.color}
                    trend=""
                    trendUp
                />
            ))}
        </div>
    )
}
