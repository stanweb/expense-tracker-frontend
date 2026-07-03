'use client'

import { cn } from "@/lib/utils"

interface ContributionsListSkeletonProps {
    count?: number
    className?: string
}

export const ContributionsListSkeleton = ({
    count = 4,
    className,
}: ContributionsListSkeletonProps) => (
    <div
        className={cn("rounded-md border border-border/40", className)}
        aria-busy="true"
        aria-label="Loading contributions"
    >
        <table className="w-full caption-bottom text-sm">
            <thead>
                <tr className="border-b border-border/40">
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">
                        Date
                    </th>
                    <th className="h-10 px-3 text-right align-middle text-xs font-medium text-muted-foreground">
                        Amount
                    </th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground sm:table-cell">
                        Transaction
                    </th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground md:table-cell">
                        Note
                    </th>
                    <th className="h-10 w-[60px] px-3 text-right align-middle" />
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: count }).map((_, i) => (
                    <tr
                        key={i}
                        className="border-b border-border/40 last:border-0"
                        aria-hidden
                    >
                        <td className="p-3 align-middle">
                            <div className="h-4 w-28 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
                        </td>
                        <td className="p-3 align-middle text-right">
                            <div className="ml-auto h-4 w-20 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
                        </td>
                        <td className="hidden p-3 align-middle sm:table-cell">
                            <div className="h-5 w-28 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                        </td>
                        <td className="hidden p-3 align-middle md:table-cell">
                            <div className="h-4 w-3/4 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                        </td>
                        <td className="p-3 align-middle text-right">
                            <div className="ml-auto h-8 w-8 rounded bg-gradient-to-br from-primary/15 to-primary/5" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)
