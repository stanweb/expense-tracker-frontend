'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Wallet, Tag, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import axiosClient from "@/utils/axioClient"
import {useSelector} from "react-redux";
import {RootState} from "@/Interfaces/Interfaces";

interface OverviewData {
    totalSpent: number
    transactionCost: number
    categoriesCount: number
    transactionsCount: number
}

export function SpendingOverview() {
    const [data, setData] = useState<OverviewData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    //Get Dates
    const { fromDate, toDate } = useSelector((state:RootState) => state.dateRange)

    useEffect(() => {
        const fetchSpendingData = async () => {
            try {
                setLoading(true)
                setError(null)
                const from = fromDate ?? ""
                const to = toDate ?? ""

                const response = await axiosClient.get(
                    `/users/1/summary-overview`,
                    {
                        params: {
                            from,
                            to,
                        },
                    }
                )

                setData(response.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data')
                console.error('Error fetching spending data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchSpendingData()
    }, [fromDate, toDate]) // ⬅️ refetch whenever user changes dates

    // Loading state
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

    // Error state
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
            {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                    <Card key={index} className="bg-card hover:bg-card/80 transition-colors">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground/60 mb-2">
                                        {metric.label}
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                                    <p
                                        className={`text-xs mt-2 ${
                                            metric.trendUp ? 'text-chart-2' : 'text-destructive'
                                        }`}
                                    >
                                        {metric.trend}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color}`}>
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
