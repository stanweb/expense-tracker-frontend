'use client'

import { cn } from "@/lib/utils"

interface GoalTableRowSkeletonProps {
    className?: string
}

const widths = [
    "w-2/5",
    "w-1/4",
    "w-1/4",
    "w-1/2",
    "w-1/3",
    "w-1/4",
    "w-1/4",
]

const GoalTableRowSkeleton = ({ className }: GoalTableRowSkeletonProps) => (
    <tr
        className={cn(
            "border-b border-border/40 transition-colors hover:bg-muted/30",
            className
        )}
        aria-hidden
    >
        <td className="p-3 align-middle">
            <div className="h-4 w-2/5 rounded bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
        </td>
        <td className="hidden p-3 align-middle text-right sm:table-cell">
            <div className="ml-auto h-4 w-20 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
        </td>
        <td className="hidden p-3 align-middle text-right sm:table-cell">
            <div className="ml-auto h-4 w-20 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
        </td>
        <td className="hidden p-3 align-middle md:table-cell">
            <div className="h-4 w-full rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        </td>
        <td className="hidden p-3 align-middle md:table-cell">
            <div className="h-4 w-16 rounded bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        </td>
        <td className="p-3 align-middle">
            <div className="h-5 w-16 rounded bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5" />
        </td>
        <td className="p-3 align-middle text-right">
            <div className="ml-auto h-8 w-8 rounded bg-gradient-to-br from-primary/15 to-primary/5" />
        </td>
    </tr>
)

interface GoalsListSkeletonProps {
    count?: number
    className?: string
}

export const GoalsListSkeleton = ({ count = 5, className }: GoalsListSkeletonProps) => (
    <div
        className={cn("rounded-lg border border-border/40", className)}
        aria-busy="true"
        aria-label="Loading goals"
    >
        <table className="w-full caption-bottom text-sm">
            <thead>
                <tr className="border-b border-border/40">
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">
                        Name
                    </th>
                    <th className="hidden h-10 px-3 text-right align-middle text-xs font-medium text-muted-foreground sm:table-cell">
                        Target
                    </th>
                    <th className="hidden h-10 px-3 text-right align-middle text-xs font-medium text-muted-foreground sm:table-cell">
                        Saved
                    </th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground md:table-cell">
                        Progress
                    </th>
                    <th className="hidden h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground md:table-cell">
                        Days left
                    </th>
                    <th className="h-10 px-3 text-left align-middle text-xs font-medium text-muted-foreground">
                        Status
                    </th>
                    <th className="h-10 w-[70px] px-3 text-right align-middle" />
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: count }).map((_, i) => (
                    <GoalTableRowSkeleton key={i} />
                ))}
            </tbody>
        </table>
    </div>
)
