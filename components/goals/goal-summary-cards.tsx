import { GoalSummary } from "@/Interfaces/Interfaces"
import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "./format"
import {
    CheckCircle2,
    CircleSlash,
    Pause,
    Target,
    TrendingUp,
    Wallet,
} from "lucide-react"

interface GoalSummaryCardsProps {
    summary: GoalSummary
}

interface KpiCardProps {
    label: string
    value: string
    icon: React.ReactNode
    accent?: string
}

function KpiCard({ label, value, icon, accent }: KpiCardProps) {
    return (
        <Card className="bg-card">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground truncate">
                            {label}
                        </p>
                        <p className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums text-foreground truncate">
                            {value}
                        </p>
                    </div>
                    <div
                        className={`h-8 w-8 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center ${accent ?? ""}`}
                    >
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function GoalSummaryCards({ summary }: GoalSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <KpiCard
                label="Active"
                value={String(summary.activeCount)}
                icon={<Target className="h-4 w-4" />}
            />
            <KpiCard
                label="Completed"
                value={String(summary.completedCount)}
                icon={<CheckCircle2 className="h-4 w-4" />}
                accent="text-emerald-600"
            />
            <KpiCard
                label="Paused"
                value={String(summary.pausedCount)}
                icon={<Pause className="h-4 w-4" />}
                accent="text-amber-600"
            />
            <KpiCard
                label="Cancelled"
                value={String(summary.cancelledCount)}
                icon={<CircleSlash className="h-4 w-4" />}
                accent="text-muted-foreground"
            />
            <KpiCard
                label="Total Target"
                value={formatMoney(summary.totalTargetAmount)}
                icon={<Wallet className="h-4 w-4" />}
            />
            <KpiCard
                label="Total Saved"
                value={formatMoney(summary.totalSavedAmount)}
                icon={<TrendingUp className="h-4 w-4" />}
                accent="text-emerald-600"
            />
        </div>
    )
}
