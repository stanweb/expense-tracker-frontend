'use client';

import { cn } from '@/lib/utils';

interface TopSpenderRowSkeletonProps {
    index: number;
    className?: string;
}

const widths = [
    'w-2/5',
    'w-1/3',
    'w-1/2',
    'w-2/5',
    'w-1/3',
];

const TopSpenderRowSkeleton = ({ index, className }: TopSpenderRowSkeletonProps) => (
    <tr
        className={cn('border-b border-border/40 transition-colors hover:bg-muted/30', className)}
        aria-hidden
    >
        <td className="p-3 align-middle w-12">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-primary/15 to-primary/5" />
        </td>
        <td className="p-3 align-middle">
            <div className={cn('h-4 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5', widths[index % widths.length])} />
        </td>
        <td className="p-3 align-middle text-right">
            <div className="ml-auto h-4 w-24 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        </td>
    </tr>
);

interface TopSpendersTableSkeletonProps {
    count?: number;
    className?: string;
}

export const TopSpendersTableSkeleton = ({ count = 5, className }: TopSpendersTableSkeletonProps) => (
    <div
        className={cn('rounded-lg border border-border/40', className)}
        aria-busy="true"
        aria-label="Loading top spenders"
    >
        <table className="w-full caption-bottom text-sm">
            <thead>
                <tr className="border-b border-border/40">
                    <th className="h-10 w-12 px-3 text-left align-middle text-xs font-medium text-muted-foreground">#</th>
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">Recipient</th>
                    <th className="h-10 px-3 text-right align-middle text-xs font-medium text-muted-foreground">Total Spent</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: count }).map((_, i) => (
                    <TopSpenderRowSkeleton key={i} index={i} />
                ))}
            </tbody>
            <tfoot>
                <tr className="border-t border-border/40">
                    <td className="p-3 text-muted-foreground" colSpan={2}>Total</td>
                    <td className="p-3 text-right">
                        <div className="ml-auto h-4 w-28 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
);
