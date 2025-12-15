'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from "react";
import { useSpendingChartData } from '@/hooks/useSpendingChartData';
import { SpendingChartFilters } from './spending-chart-filters';

export function SpendingChart() {
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { chartData, loading, error, categories, userId } = useSpendingChartData(selectedYear, selectedCategory);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => String(currentYear + 1 - i));

    const renderContent = () => {
        if (!userId) {
            return <p className="text-muted-foreground">No user data available.</p>;
        }
        if (loading) {
            return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>;
        }
        if (error || chartData.length === 0) {
            const noDataMessage = `No spending data available for ${selectedCategory === 'all' ? 'all categories' : categories.find(c => String(c.id) === selectedCategory)?.name || 'selected category'} in ${selectedYear}.`;
            return <p className="text-muted-foreground">{noDataMessage}</p>;
        }
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-foreground)" opacity={0.6} />
                    <YAxis stroke="var(--color-foreground)" opacity={0.6} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px'
                        }}
                        cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="spent" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="budget" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
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
            <CardContent className="flex items-center justify-center h-[300px]">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
