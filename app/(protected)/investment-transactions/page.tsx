import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { InvestmentTransactionsList } from "@/components/portfolio/investment-transactions-list"

function InvestmentTransactionsListFallback() {
    return (
        <div className="rounded-lg border border-border/40 bg-card p-6 text-sm text-muted-foreground">
            Loading transactions…
        </div>
    )
}

export default function InvestmentTransactionsPage() {
    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Investment <span className="text-primary">Transactions</span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Browse and filter every buy, sell, and interest payment across your portfolios.
                    </p>
                </div>

                <Suspense fallback={<InvestmentTransactionsListFallback />}>
                    <InvestmentTransactionsList />
                </Suspense>
            </main>
        </div>
    )
}