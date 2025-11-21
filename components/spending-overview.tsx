'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Wallet, Tag, ArrowUpRight } from 'lucide-react'
import { useSelector } from "react-redux";
import { RootState } from "@/Interfaces/Interfaces";
import { ActiveCategoryItem } from "@/components/active-category-item";

export function SpendingOverview() {
    const { data, loading, error } = useSelector((state: RootState) => state.overview);

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

    if (error || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-destructive font-medium">Failed to load data</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {error || 'No data available'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const metrics = [
        {
            label: 'Total Spent',
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
    )
}
