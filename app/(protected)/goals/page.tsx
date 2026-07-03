import { DashboardHeader } from "@/components/dashboard-header"
import { GoalsList } from "@/components/goals/goals-list"

export default function GoalsPage() {
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Savings <span className="text-primary">Goals</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create savings targets, track your progress, and link
                        contributions to your transactions.
                    </p>
                </div>

                <GoalsList />
            </main>
        </div>
    )
}
