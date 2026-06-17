'use client'

import { DashboardHeader } from '@/components/dashboard-header';
import { AllTransactionsList } from '@/components/user-transactions-components/all-transactions-list';
import { DateRangePicker } from '@/components/date-range-picker/date-range-picker';
import { useSelector } from "react-redux";
import { RootState } from "@/Interfaces/Interfaces";

const formatDate = (d: Date | undefined) =>
    d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

export default function AllTransactionsPage() {
  const { fromDate, toDate, transactionType } = useSelector((s: RootState) => s.dateRange);

  const rangeSummary = (() => {
    if (!fromDate && !toDate && transactionType === 'all') return "All time";
    const f = fromDate ? new Date(fromDate) : undefined;
    const t = toDate ? new Date(toDate) : undefined;
    const parts: string[] = [];
    if (f && t) parts.push(`${formatDate(f)} – ${formatDate(t)}`);
    else if (f) parts.push(`From ${formatDate(f)}`);
    else if (t) parts.push(`Up to ${formatDate(t)}`);
    if (transactionType !== 'all') parts.push(transactionType === 'spent' ? 'spent only' : 'received only');
    return parts.length ? parts.join(' · ') : "All time";
  })();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              All <span className="text-primary">Transactions</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground/80">{rangeSummary}</span>
            </p>
          </div>
          <DateRangePicker />
        </div>

        <AllTransactionsList />
      </main>
    </div>
  );
}
