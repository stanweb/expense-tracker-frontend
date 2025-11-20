'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import {useEffect, useState} from "react";
import axioClient from "@/utils/axioClient";


export function CategoryBreakdown() {

    const [categoryData, setCategoryData] = useState([])

    useEffect(()=> {
        axioClient.get("users/1/category/summary")
            .then((res)=> setCategoryData(res.data) )
    }, [])
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Spending breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={"oklch(0.205 0 0)"} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
