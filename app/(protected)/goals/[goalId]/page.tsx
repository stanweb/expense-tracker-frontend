import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { GoalDetail } from "@/components/goals/goal-detail"

function GoalDetailFallback() {
    return (
        <div className="rounded-lg border border-border/40 bg-card p-6 text-sm text-muted-foreground">
            Loading goal…
        </div>
    )
}

export default async function GoalDetailPage({
    params,
}: {
    params: Promise<{ goalId: string }>
}) {
    const { goalId } = await params
    const numericId = Number(goalId)
    if (!Number.isFinite(numericId)) {
        return (
            <div className="min-h-screen bg-background">
                <DashboardHeader />
                <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        Invalid goal id.
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
                <Suspense fallback={<GoalDetailFallback />}>
                    <GoalDetail goalId={numericId} />
                </Suspense>
            </main>
        </div>
    )
}
