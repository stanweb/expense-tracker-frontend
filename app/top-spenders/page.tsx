'use client'

import { DashboardHeader } from '@/components/dashboard-header';
import { TopSpendersList } from '@/components/user-transactions-components/top-spenders-list';
import { DateRangePicker } from '@/components/DateRangePicker/date-range-picker';

export default function TopSpendersPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold">Top Spenders</h1>
        <DateRangePicker />
        <TopSpendersList />
      </main>
    </div>
  );
}
