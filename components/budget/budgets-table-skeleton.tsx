'use client';

import { cn } from '@/lib/utils';

interface BudgetTableRowSkeletonProps {
    className?: string;
}

const widths = [
    'w-2/5',
    'w-1/3',
    'w-1/2',
    'w-2/5',
    'w-1/3',
    'w-1/2',
    'w-2/5',
];

const BudgetTableRowSkeleton = ({ className }: BudgetTableRowSkeletonProps) => (
    <tr
        className={cn(
            'border-b border-border/40 transition-colors hover:bg-muted/30',
            className,
        )}
        aria-hidden
    >
        <td className="p-3 align-middle">
            <div className="flex items-center gap-2">
                <div className="h-5 w-5 shrink-0 rounded bg-gradient-to-br from-primary/20 to-primary/5" />
                <div className={cn('h-4 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5', widths[0])} />
            </div>
        </td>
        <td className="p-3 align-middle">
            <div className={cn('h-4 w-24 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5')} />
        </td>
        <td className="hidden p-3 align-middle sm:table-cell">
            <div className={cn('h-4 w-20 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent')} />
        </td>
        <td className="hidden p-3 align-middle sm:table-cell">
            <div className={cn('h-4 w-16 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent')} />
        </td>
        <td className="p-3 align-middle text-right">
            <div className="ml-auto h-8 w-8 rounded bg-gradient-to-br from-primary/15 to-primary/5" />
        </td>
    </tr>
);

interface BudgetsTableSkeletonProps {
    count?: number;
    className?: string;
}

export const BudgetsTableSkeleton = ({ count = 5, className }: BudgetsTableSkeletonProps) => (
    <div
        className={cn('rounded-lg border border-border/40', className)}
        aria-busy="true"
        aria-label="Loading budgets"
    >
        <table className="w-full caption-bottom text-sm">
            <thead>
                <tr className="border-b border-border/40">
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">Category</th>
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground sm:table-cell">Month</th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground sm:table-cell">Year</th>
                    <th className="h-10 px-3 text-right align-middle text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: count }).map((_, i) => (
                    <BudgetTableRowSkeleton key={i} />
                ))}
            </tbody>
        </table>
    </div>
);
