'use client'

import { TransactionListBase } from "@/components/user-transactions-components/transaction-list-base";

export function RecentTransactionsList() {
    return (
        <TransactionListBase
            title="Recent Transactions"
            description="Your latest spending activities"
            limit={6}
            variant="dashboard"
        />
    )
}
