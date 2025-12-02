'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from "react";
import axioClient from "@/utils/axioClient";
import {COLORS} from "../utils/constants"
import { useSelector } from "react-redux";
import { RootState } from "@/Interfaces/Interfaces";
import Link from "next/link";
import {Button} from "@/components/ui/button";



export function CategoryBreakdown() {
    const { fromDate, toDate } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [categoryData, setCategoryData] = useState<any[]>([])

    useEffect(() => {
        if (fromDate && toDate && userId) {
            axioClient.get(`users/${userId}/category/summary`, {
                params: {
                    startDate: fromDate,
                    endDate: toDate
                }
            })
                .then((res) => {
                    const data = res.data;
                    const threshold = 2;
                    const mainCategories = data.filter((item: any) => item.value >= threshold);
                    const otherValue = data
                        .filter((item: any) => item.value < threshold)
                        .reduce((acc: number, item: any) => acc + item.value, 0);

                    if (otherValue > 0) {
                        setCategoryData([...mainCategories, { name: 'Others', value: otherValue }]);
                    } else {
                        setCategoryData(mainCategories);
                    }
                })
        }
    }, [fromDate, toDate, userId])

    return (
        <Card className="bg-card">
            <CardHeader className={"flex flex-row items-center justify-between"}>
                <div>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Spending breakdown by category</CardDescription>
                </div>
                <div className="text-center">
                    <Link href="/top-spenders" passHref>
                        <Button variant="default">View Top Spenders</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                    </PieChart>
                </ResponsiveContainer>

            </CardContent>
        </Card>
    )
}
