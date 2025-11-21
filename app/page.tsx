'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { SpendingOverview } from '@/components/spending-overview'
import { SpendingChart } from '@/components/spending-chart'
import { CategoryBreakdown } from '@/components/category-breakdown'
import { TransactionsList } from '@/components/user-transactions-components/transactions-list'
import { TrendChart } from '@/components/trend-chart'
import {DateRangePicker} from "@/components/DateRangePicker/date-range-picker";
import {useSelector} from "react-redux";
import {RootState} from "@/Interfaces/Interfaces";

interface DashboardData {
  totalSpent: number
  transactionCost: number
  categoriesCount: number
  transactionsCount: number
}

export default function Dashboard() {
    const { loading, } = useSelector((state: RootState) => state.overview);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

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
          <TransactionsList />
        </div>
      </main>
    </div>
  )
}
