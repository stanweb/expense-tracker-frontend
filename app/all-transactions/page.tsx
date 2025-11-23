'use client'

import { DashboardHeader } from '@/components/dashboard-header';
import { AllTransactionsList } from '@/components/user-transactions-components/all-transactions-list';
import { DateRangePicker } from '@/components/DateRangePicker/date-range-picker';

export default function AllTransactionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DateRangePicker />
        <AllTransactionsList />
      </main>
    </div>
  );
}
