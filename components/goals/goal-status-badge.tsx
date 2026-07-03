import { Badge } from "@/components/ui/badge"
import { GoalStatus } from "@/Interfaces/Interfaces"
import { cn } from "@/lib/utils"

interface GoalStatusBadgeProps {
    status: GoalStatus
    className?: string
}

const statusStyles: Record<GoalStatus, string> = {
    ACTIVE: "bg-primary/15 text-primary border-primary/20",
    PAUSED: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    COMPLETED: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    CANCELLED: "bg-muted text-muted-foreground border-border",
}

const statusLabel: Record<GoalStatus, string> = {
    ACTIVE: "Active",
    PAUSED: "Paused",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
}

export function GoalStatusBadge({ status, className }: GoalStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn("font-medium", statusStyles[status], className)}
        >
            {statusLabel[status]}
        </Badge>
    )
}
