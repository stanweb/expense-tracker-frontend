'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from "axios";
import {useEffect, useState} from "react";

// const chartData = [
//   { month: 'Jan', spent: 4000, budget: 5000, cost: 240 },
//   { month: 'Feb', spent: 3000, budget: 5000, cost: 221 },
//   { month: 'Mar', spent: 2000, budget: 5000, cost: 229 },
//   { month: 'Apr', spent: 2780, budget: 5000, cost: 200 },
//   { month: 'May', spent: 1890, budget: 5000, cost: 229 },
//   { month: 'Jun', spent: 2390, budget: 5000, cost: 200 },
//   { month: 'Jul', spent: 3490, budget: 5000, cost: 221 },
// ]



export function SpendingChart() {

    const  [chartData, setChartData] = useState([])

    useEffect(()=>{
        axios.get('http://localhost:8080/api/users/1/monthly/breakdown')
            .then(res => {
                console.log(res)
                setChartData(res.data)
            })
            .catch(err => {console.log(err)})
    },[])

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>Monthly spending vs budget comparison</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
