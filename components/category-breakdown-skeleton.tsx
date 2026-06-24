'use client';

import { cn } from '@/lib/utils';

interface CategoryBreakdownSkeletonProps {
    className?: string;
}

export const CategoryBreakdownSkeleton = ({ className }: CategoryBreakdownSkeletonProps) => (
    <div
        className={cn('grid h-[280px] w-full grid-cols-1 items-center gap-4 lg:grid-cols-5', className)}
        aria-busy="true"
        aria-label="Loading category data"
    >
        <div className="flex items-center justify-center lg:col-span-2">
            <div className="relative aspect-square h-[220px] w-[220px]">
                <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90" aria-hidden>
                    <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="currentColor"
                        className="text-primary/15"
                        strokeWidth="6"
                    />
                    <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="url(#catGradient)"
                        strokeWidth="6"
                        strokeDasharray="38 62"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="currentColor"
                        className="text-primary/20"
                        strokeWidth="6"
                        strokeDasharray="14 86"
                        strokeDashoffset="-40"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-[26%] rounded-full bg-card" />
            </div>
        </div>

        <div className="space-y-2 lg:col-span-3">
            {[
                { color: 'w-2/5', label: 'w-2/5', value: 'w-10' },
                { color: 'w-2/5', label: 'w-1/3', value: 'w-12' },
                { color: 'w-2/5', label: 'w-1/2', value: 'w-10' },
                { color: 'w-2/5', label: 'w-2/5', value: 'w-12' },
            ].map((row, i) => (
                <div key={i} className="flex items-center gap-3" aria-hidden>
                    <div className="h-2.5 w-2.5 shrink-0 rounded-sm bg-gradient-to-br from-primary/30 to-primary/10" />
                    <div className={cn('h-3.5 flex-1 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5', row.label)} />
                    <div className={cn('h-3.5 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5', row.value)} />
                </div>
            ))}
        </div>
    </div>
);
