'use client'

import { TransactionListBase } from "@/components/user-transactions-components/transaction-list-base";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function RecentTransactionsList() {
    return (
        <TransactionListBase
            title="Recent Transactions"
            description="Your latest spending activities"
            limit={20}
        >
            <div className="mt-4 text-center">
                <Link href="/all-transactions" passHref>
                    <Button variant="outline">View All Transactions</Button>
                </Link>
            </div>
        </TransactionListBase>
    )
}
