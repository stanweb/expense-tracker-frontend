'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/user-transactions-components/add-transaction-modal";
import ConfirmTransactionModal from "@/components/confrim-transaction";
import { ParsedTransaction, RootState } from "@/Interfaces/Interfaces";
import { useDispatch, useSelector } from "react-redux";
import { TransactionItem } from "@/components/user-transactions-components/transaction-item";
import { useState } from 'react';
import axioClient from '@/utils/axioClient';
import { updateDateRangeAndFetchData } from '@/app/store/thunks';
import { AppDispatch } from '@/app/store/store';

export function TransactionsList() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: transactions, loading, error } = useSelector((state: RootState) => state.transactions);
    const [showAddRawTransactionModal, setShowAddRawTransactionModal] = useState(false);
    const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false);
    const [parsedTransactionData, setParsedTransactionData] = useState<ParsedTransaction>();

    const parseTransaction = (message: string) => {
        axioClient
            .post("/users/raw/transaction", { message })
            .then((response) => {
                setParsedTransactionData(response.data);
                setShowConfirmTransactionModal(true);
            })
            .catch((error) => {
                console.error("Error parsing transaction:", error);
            });
    };
    console.log(transactions)
    
    const handleSuccess = () => {
        setShowConfirmTransactionModal(false);
        dispatch(updateDateRangeAndFetchData(null));
    }

    return (
        <Card className="bg-card">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest spending activities</CardDescription>
                </div>

                <Button
                    className="ml-auto"
                    variant="default"
                    onClick={() => setShowAddRawTransactionModal(true)}
                >
                    Add Transaction
                </Button>
            </CardHeader>

            <CardContent>
                <AddTransactionModal
                    isOpen={showAddRawTransactionModal}
                    onClose={() => setShowAddRawTransactionModal(false)}
                    onSubmit={(rawMessage) => parseTransaction(rawMessage)}
                />
                {parsedTransactionData != null && (
                    <ConfirmTransactionModal
                        isOpen={showConfirmTransactionModal}
                        onClose={() => setShowConfirmTransactionModal(false)}
                        parsed={parsedTransactionData}
                        onSuccess={handleSuccess}
                    />
                )}

                <ScrollArea className="h-[320px] pr-4">
                    {loading && <p>Loading...</p>}
                    {error && <p>Error: {error}</p>}
                    {!loading && !error && (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <TransactionItem key={transaction.id} transaction={transaction} />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
