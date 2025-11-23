'use client'

import { TransactionListBase } from "@/components/user-transactions-components/transaction-list-base";

export function AllTransactionsList() {
    return (
        <TransactionListBase
            title="All Transactions"
            description="View all your spending activities"
            showAutoCategorizeButton={true} // Enable the auto-categorize button
            // No limit prop means it will fetch all transactions
        />
    )
}
