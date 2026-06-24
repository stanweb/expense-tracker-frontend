'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface SpendingOverviewCardSkeletonProps {
    className?: string;
}

export const SpendingOverviewCardSkeleton = ({ className }: SpendingOverviewCardSkeletonProps) => (
    <Card className={cn('bg-card', className)} aria-hidden>
        <CardContent className="pt-6">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
                    <div className="h-8 w-3/4 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                    <div className="h-3 w-1/3 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                </div>
                <div className="h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5" />
            </div>
        </CardContent>
    </Card>
);

interface SpendingOverviewSkeletonProps {
    count?: number;
    className?: string;
}

export const SpendingOverviewSkeleton = ({ count = 4, className }: SpendingOverviewSkeletonProps) => (
    <div
        className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}
        aria-busy="true"
        aria-label="Loading spending overview"
    >
        {Array.from({ length: count }).map((_, i) => (
            <SpendingOverviewCardSkeleton key={i} />
        ))}
    </div>
);
