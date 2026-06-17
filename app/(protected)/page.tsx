'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { SpendingOverview } from '@/components/spending-overview'
import { SpendingChart } from '@/components/spending-chart'
import { CategoryBreakdown } from '@/components/category-breakdown'
import { RecentTransactionsList } from '@/components/user-transactions-components/recent-transactions-list'
import { TrendChart } from '@/components/trend-chart'
import { DateRangePicker } from "@/components/date-range-picker/date-range-picker";
import { useSelector } from "react-redux";
import { RootState } from "@/Interfaces/Interfaces";

const formatDate = (d: Date | undefined) =>
    d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

export default function Dashboard() {
  const { fromDate, toDate } = useSelector((s: RootState) => s.dateRange);
  const username = useSelector((s: RootState) => s.user.username);

  const rangeSummary = (() => {
    if (!fromDate && !toDate) return "All time";
    const f = fromDate ? new Date(fromDate) : undefined;
    const t = toDate ? new Date(toDate) : undefined;
    if (f && t) return `${formatDate(f)} – ${formatDate(t)}`;
    if (f) return `From ${formatDate(f)}`;
    if (t) return `Up to ${formatDate(t)}`;
    return "All time";
  })();

  const firstName = username?.split(/[._-]/)[0] || username || "there";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Toolbar: heading + filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, <span className="text-primary capitalize">{firstName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your spending overview · <span className="font-medium text-foreground/80">{rangeSummary}</span>
            </p>
          </div>
          <DateRangePicker />
        </div>

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
