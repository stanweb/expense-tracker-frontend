'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axioClient from '@/utils/apiClient'
import { COLORS } from '@/utils/constants'
import { useSelector } from 'react-redux'
import { RootState } from '@/Interfaces/Interfaces'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Plus, Inbox, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryDatum {
    [key: string]: string | number
    name: string
    value: number
}

const TOP_N = 5

const hashName = (name: string): number => {
    let h = 5381
    for (let i = 0; i < name.length; i++) h = (h * 33) ^ name.charCodeAt(i)
    return Math.abs(h)
}

const colorFor = (name: string) => COLORS[hashName(name) % COLORS.length]

const formatPercent = (n: number) => `${n.toFixed(n < 10 ? 1 : 0)}%`

export function CategoryBreakdown() {
    const { fromDate, toDate, transactionTrigger } = useSelector((state: RootState) => state.dateRange)
    const userId = useSelector((state: RootState) => state.user.userId)
    const [rawData, setRawData] = useState<CategoryDatum[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        setError(null)
        axioClient
            .get(`users/${userId}/analytics/categories`, {
                params: { from: fromDate, to: toDate },
            })
            .then((res) => {
                setRawData(Array.isArray(res.data) ? res.data : [])
            })
            .catch((err) => {
                console.error(err)
                setError(err?.response?.data?.message || err.message || 'Failed to load category data')
                setRawData([])
            })
            .finally(() => setLoading(false))
    }, [fromDate, toDate, userId, transactionTrigger])

    const { chartData, topCategory, othersCount } = useMemo(() => {
        const sorted = [...rawData].sort((a, b) => b.value - a.value)
        const top = sorted.slice(0, TOP_N)
        const rest = sorted.slice(TOP_N)
        const restSum = rest.reduce((acc, item) => acc + item.value, 0)
        const series = restSum > 0
            ? [...top, { name: 'Others', value: restSum }]
            : top
        return {
            chartData: series,
            topCategory: top[0],
            othersCount: rest.length,
        }
    }, [rawData])

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>
                        {topCategory
                            ? <>Top: <span className="font-medium text-foreground">{topCategory.name}</span> · {formatPercent(topCategory.value)}</>
                            : 'Spending breakdown by category'}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" aria-busy="true" aria-label="Loading category data">
                        <div className="lg:col-span-2 flex items-center justify-center py-4">
                            <div className="relative h-[200px] w-[200px]">
                                <Skeleton className="absolute inset-0 rounded-full" />
                                <div className="absolute inset-[26%] rounded-full bg-card" />
                            </div>
                        </div>
                        <div className="lg:col-span-3 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-3 w-3 rounded-sm" />
                                    <Skeleton className="h-3.5 flex-1" />
                                    <Skeleton className="h-3.5 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!loading && !error && chartData.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Inbox className="h-10 w-10 text-muted-foreground/50" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">No category data for this period.</p>
                            <p className="text-xs text-muted-foreground">Try widening the date range, or add transactions to see the breakdown.</p>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/all-transactions">
                                <Plus className="h-4 w-4" />
                                Add transaction
                            </Link>
                        </Button>
                    </div>
                )}

                {!loading && !error && chartData.length > 0 && (
                    <>
                        <ul className="sr-only" aria-label="Top spending categories">
                            {chartData.map((c) => (
                                <li key={c.name}>
                                    {c.name}: {formatPercent(c.value)}
                                </li>
                            ))}
                        </ul>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                            <div className="lg:col-span-2 min-h-[220px] aspect-square max-h-[260px] mx-auto w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="62%"
                                            outerRadius="100%"
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                            onMouseEnter={(_, index) => setActiveIndex(index)}
                                            onMouseLeave={() => setActiveIndex(null)}
                                        >
                                            {chartData.map((entry) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={colorFor(entry.name)}
                                                    className="outline-none transition-opacity"
                                                    fillOpacity={activeIndex === null || activeIndex === chartData.indexOf(entry) ? 1 : 0.45}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, _name, props) => {
                                                const label = (props?.payload?.name as string) ?? ''
                                                return [`${value.toFixed(value < 10 ? 1 : 0)}%`, label]
                                            }}
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: '1px solid hsl(var(--border))',
                                                background: 'hsl(var(--popover))',
                                                color: 'hsl(var(--popover-foreground))',
                                                fontSize: 12,
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <ul className="lg:col-span-3 space-y-1.5" aria-hidden>
                                {chartData.map((c) => {
                                    const isActive = activeIndex === chartData.indexOf(c)
                                    const isOthers = c.name === 'Others'
                                    const label = isOthers && othersCount > 0 ? `Others (${othersCount} more)` : c.name
                                    return (
                                        <li
                                            key={c.name}
                                            onMouseEnter={() => setActiveIndex(chartData.indexOf(c))}
                                            onMouseLeave={() => setActiveIndex(null)}
                                            className={cn(
                                                'group flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                                                isActive ? 'bg-muted/60' : 'hover:bg-muted/40',
                                            )}
                                        >
                                            <span
                                                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                                style={{ backgroundColor: colorFor(c.name) }}
                                                aria-hidden
                                            />
                                            <span className={cn('flex-1 truncate', isActive ? 'text-foreground font-medium' : 'text-foreground/80')}>
                                                {label}
                                            </span>
                                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                                {formatPercent(c.value)}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        {chartData.length > 0 && (
                            <div className="flex items-center justify-between border-t pt-3">
                                <p className="text-xs text-muted-foreground">
                                    Showing top {Math.min(TOP_N, rawData.length)} of {rawData.length} {rawData.length === 1 ? 'category' : 'categories'}
                                </p>
                                <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                                    <Link href="/top-spenders">View top spenders →</Link>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}