'use client';

import { cn } from '@/lib/utils';

interface SpendingChartSkeletonProps {
    className?: string;
}

const barPercents = [
    { spent: 50, budget: 75 },
    { spent: 65, budget: 80 },
    { spent: 45, budget: 70 },
    { spent: 75, budget: 85 },
    { spent: 58, budget: 75 },
    { spent: 82, budget: 88 },
    { spent: 50, budget: 75 },
    { spent: 65, budget: 80 },
    { spent: 45, budget: 70 },
    { spent: 60, budget: 82 },
    { spent: 72, budget: 75 },
    { spent: 52, budget: 80 },
];

export const SpendingChartSkeleton = ({ className }: SpendingChartSkeletonProps) => (
    <div
        className={cn('flex h-[280px] w-full flex-col gap-2', className)}
        aria-busy="true"
        aria-label="Loading spending data"
    >
        <div className="flex min-h-0 flex-1 gap-2">
            <div className="flex w-10 shrink-0 flex-col justify-between py-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-2.5 w-6 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                    />
                ))}
            </div>

            <div className="flex min-h-0 flex-1 items-end gap-1 border-b border-l border-border/40 pl-1">
                {barPercents.map((bar, i) => (
                    <div
                        key={i}
                        className="flex h-full min-h-0 flex-1 flex-col items-stretch justify-end gap-px"
                        aria-hidden
                    >
                        <div
                            style={{ height: `${bar.spent}%` }}
                            className="w-full rounded-t bg-gradient-to-t from-primary/30 via-primary/20 to-primary/10"
                        />
                        <div
                            style={{ height: `${bar.budget}%` }}
                            className="w-full rounded-t border border-dashed border-muted-foreground/30 bg-gradient-to-t from-muted/30 to-muted/10"
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex pl-12">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 text-center" aria-hidden>
                    <div className="mx-auto h-2.5 w-3 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                </div>
            ))}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-4 pb-1 text-xs">
            <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-gradient-to-br from-primary/40 to-primary/15" />
                <span className="h-2.5 w-10 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
            </span>
            <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-dashed border-muted-foreground/40 bg-muted/20" />
                <span className="h-2.5 w-10 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            </span>
        </div>
    </div>
);
