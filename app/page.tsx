'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { SpendingOverview } from '@/components/spending-overview'
import { SpendingChart } from '@/components/spending-chart'
import { CategoryBreakdown } from '@/components/category-breakdown'
import { RecentTransactionsList } from '@/components/user-transactions-components/recent-transactions-list'
import { TrendChart } from '@/components/trend-chart'
import {DateRangePicker} from "@/components/DateRangePicker/date-range-picker";
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button'; // Import Button

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
          <DateRangePicker/>
        {/* Overview Cards */}
          <SpendingOverview />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart />
          </div>
          <div className="lg:col-span-1">
            <CategoryBreakdown />
          </div>
        </div>

        {/* Trend and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart />
          <RecentTransactionsList />
        </div>
      </main>
    </div>
  )
}
