'use client';

import { cn } from '@/lib/utils';

interface TransactionListSkeletonProps {
    count?: number;
    className?: string;
    compact?: boolean;
}

const widths = [
    { title: 'w-2/5', subtitle: 'w-1/3', amount: 'w-16' },
    { title: 'w-1/2', subtitle: 'w-1/4', amount: 'w-24' },
    { title: 'w-1/3', subtitle: 'w-2/5', amount: 'w-20' },
    { title: 'w-2/5', subtitle: 'w-1/3', amount: 'w-20' },
    { title: 'w-1/2', subtitle: 'w-1/4', amount: 'w-16' },
    { title: 'w-2/5', subtitle: 'w-1/3', amount: 'w-24' },
];

export const TransactionListSkeleton = ({ count = 6, className, compact = false }: TransactionListSkeletonProps) => {
    const rowClassName = compact
        ? 'flex items-center gap-3 py-2 bg-transparent border-0'
        : 'flex items-center gap-3 rounded-lg border border-border/40 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent p-3';

    return (
        <div
            className={cn(compact ? 'divide-y divide-border/60' : 'space-y-3', className)}
            aria-busy="true"
            aria-label="Loading transactions"
        >
            {Array.from({ length: count }).map((_, i) => {
                const w = widths[i % widths.length];
                return (
                    <div key={i} className={rowClassName} aria-hidden>
                        <div className={cn(
                            'shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5',
                            compact ? 'h-9 w-9' : 'h-10 w-10',
                        )} />
                        <div className="flex-1 space-y-2">
                            <div className={cn(
                                'rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5',
                                compact ? 'h-3.5' : 'h-4',
                                w.title,
                            )} />
                            <div className={cn(
                                'rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
                                compact ? 'h-3' : 'h-3',
                                w.subtitle,
                            )} />
                        </div>
                        <div className={cn(
                            'rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5',
                            compact ? 'h-4 w-16' : 'h-5 w-20',
                        )} />
                    </div>
                );
            })}
        </div>
    );
};
