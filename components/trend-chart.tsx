'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const trendData = [
  { week: 'Week 1', spending: 2400, forecast: 2400 },
  { week: 'Week 2', spending: 1398, forecast: 2210 },
  { week: 'Week 3', spending: 9800, forecast: 2290 },
  { week: 'Week 4', spending: 3908, forecast: 2000 },
  { week: 'Week 5', spending: 4800, forecast: 2181 },
  { week: 'Week 6', spending: 3800, forecast: 2500 },
  { week: 'Week 7', spending: 4300, forecast: 2100 },
]

export function TrendChart() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Weekly spending vs forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="week" stroke="var(--color-foreground)" opacity={0.6} />
            <YAxis stroke="var(--color-foreground)" opacity={0.6} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="spending" 
              stroke="var(--color-chart-1)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-chart-1)', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="var(--color-chart-2)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'var(--color-chart-2)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
