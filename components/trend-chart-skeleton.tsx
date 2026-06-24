'use client';

import { cn } from '@/lib/utils';

interface TrendChartSkeletonProps {
    className?: string;
}

export const TrendChartSkeleton = ({ className }: TrendChartSkeletonProps) => (
    <div
        className={cn('flex h-full min-h-[220px] flex-col gap-3', className)}
        aria-busy="true"
        aria-label="Loading trend data"
    >
        <div className="flex flex-1 gap-3">
            <div className="flex w-10 flex-col justify-between py-2">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-2.5 w-7 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                    />
                ))}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-md bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                <div className="absolute inset-x-0 top-3/4 h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

                <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 100 50"
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    <path
                        d="M 0 38 L 10 32 L 20 35 L 30 26 L 40 28 L 50 20 L 60 22 L 70 14 L 80 16 L 90 8 L 100 12"
                        fill="none"
                        stroke="currentColor"
                        className="text-primary/40"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 0 42 L 10 40 L 20 36 L 30 34 L 40 30 L 50 28 L 60 24 L 70 22 L 80 18 L 90 16 L 100 12"
                        fill="none"
                        stroke="currentColor"
                        className="text-muted-foreground/40"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded-full bg-gradient-to-r from-primary/60 to-primary/30" />
                <span className="h-2.5 w-10 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
            </span>
            <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded-full border-t-2 border-dashed border-muted-foreground/40" />
                <span className="h-2.5 w-12 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            </span>
        </div>

        <div className="flex justify-between px-10">
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="h-2.5 w-6 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"
                />
            ))}
        </div>
    </div>
);
