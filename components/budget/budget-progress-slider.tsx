'use client';

import { cn } from '@/lib/utils';

interface BudgetProgressSliderProps {
    amount: number;
    spent: number;
    className?: string;
}

const formatKES = (n: number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    }).format(n);

export function BudgetProgressSlider({ amount, spent, className }: BudgetProgressSliderProps) {
    const safeAmount = amount > 0 ? amount : 1;
    const ratio = spent / safeAmount;
    const percent = Math.min(100, Math.round(ratio * 100));
    const displayPercent = Math.round(ratio * 100);

    let trackClass: string;
    let thumbClass: string;
    let labelClass: string;
    let statusLabel: string;

    if (ratio < 0.75) {
        trackClass = 'bg-emerald-500/20';
        thumbClass = 'bg-emerald-500';
        labelClass = 'text-emerald-600 dark:text-emerald-400';
        statusLabel = 'Within budget';
    } else if (ratio <= 1) {
        trackClass = 'bg-amber-500/20';
        thumbClass = 'bg-amber-500';
        labelClass = 'text-amber-600 dark:text-amber-400';
        statusLabel = 'Approaching limit';
    } else {
        trackClass = 'bg-red-500/20';
        thumbClass = 'bg-red-500';
        labelClass = 'text-red-600 dark:text-red-400';
        statusLabel = 'Over budget';
    }

    return (
        <div className={cn('flex flex-col gap-1.5 min-w-[180px]', className)}>
            <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-foreground">
                    {formatKES(spent)}{' '}
                    <span className="text-muted-foreground font-normal">
                        of {formatKES(amount)}
                    </span>
                </span>
                <span className={cn('font-semibold tabular-nums', labelClass)}>
                    {displayPercent}%
                </span>
            </div>
            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={displayPercent}
                aria-label={`${statusLabel}: ${displayPercent}% of budget spent`}
                className={cn(
                    'relative h-2 w-full overflow-hidden rounded-full',
                    trackClass,
                )}
            >
                <div
                    className={cn('h-full rounded-full transition-all', thumbClass)}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
