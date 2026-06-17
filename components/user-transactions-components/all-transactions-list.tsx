'use client'

import { TransactionListBase } from "@/components/user-transactions-components/transaction-list-base";

export function AllTransactionsList() {
    return (
        <TransactionListBase
            paginate={true}
            pageSize={7}
            showAutoCategorizeButton={true}
        />
    )
}
