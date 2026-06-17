'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from "react";
import { useSpendingChartData } from '@/hooks/useSpendingChartData';
import { SpendingChartFilters } from './spending-chart-filters';
import { Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    }).format(v);

const formatCurrencyCompact = (v: number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
        notation: 'compact',
    }).format(v);

export function SpendingChart() {
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { chartData, loading, error, categories, userId } = useSpendingChartData(selectedYear, selectedCategory);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => String(currentYear + 1 - i));

    const renderContent = () => {
        if (!userId) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                    <Inbox className="h-8 w-8 opacity-50" />
                    <p className="text-sm">Sign in to see your spending history.</p>
                </div>
            );
        }
        if (loading) {
            return (
                <div className="space-y-3" aria-busy="true" aria-label="Loading spending data">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-[260px] w-full" />
                </div>
            );
        }
        if (error) {
            return (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
            );
        }
        if (chartData.length === 0) {
            const scope = selectedCategory === 'all'
                ? 'all categories'
                : categories.find(c => String(c.id) === selectedCategory)?.name || 'the selected category';
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">No spending data for {scope} in {selectedYear}.</p>
                        <p className="text-xs text-muted-foreground">Try a different year, pick another category, or add a transaction.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/all-transactions">View transactions</Link>
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-foreground)" opacity={0.6} />
                    <YAxis
                        stroke="var(--color-foreground)"
                        opacity={0.6}
                        tickFormatter={(v: number) => formatCurrencyCompact(v)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px'
                        }}
                        cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="spent" name="Spent" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="budget" name="Budget" fill="var(--color-chart-3)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Monthly spending vs budget comparison</CardDescription>
                </div>
                <SpendingChartFilters
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    years={years}
                />
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
