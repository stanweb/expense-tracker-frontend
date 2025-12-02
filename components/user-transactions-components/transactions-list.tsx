'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/user-transactions-components/add-transaction-modal";
import { ApiTransaction, ParsedTransaction, RootState, UiTransaction } from "@/Interfaces/Interfaces";
import { useSelector } from "react-redux";
import { TransactionItem } from "@/components/user-transactions-components/transaction-item";
import { useEffect, useRef, useState } from 'react';
import axioClient from '@/utils/axioClient';
import { getIcon, formatDaysAgo } from '@/utils/helpers';
import ConfirmTransactionModal from "@/components/user-transactions-components/confrim-transaction";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { EditTransactionCategoryModal } from "@/components/user-transactions-components/edit-transaction-category-modal";
import { ConfirmDeleteTransactionModal } from "@/components/user-transactions-components/confirm-delete-transaction-modal"; // Import the new modal

export function TransactionsList() {
    const { fromDate, toDate, transactionType } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [transactions, setTransactions] = useState<UiTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddRawTransactionModal, setShowAddRawTransactionModal] = useState(false);
    const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false);
    const [parsedTransactionData, setParsedTransactionData] = useState<ParsedTransaction>();
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<UiTransaction | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
    const [transactionToDelete, setTransactionToDelete] = useState<UiTransaction | null>(null); // State for transaction to delete
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTransactionsData = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            let typeParam = '';
            if (transactionType === 'spent') {
                typeParam = 'paid,sent';
            } else if (transactionType === 'received') {
                typeParam = 'received';
            }

            const response = await axioClient.get<ApiTransaction[]>(`/users/${userId}/transactions`, {
                params: {
                    from: fromDate ?? '',
                    to: toDate ?? '',
                    ...(typeParam && { type: typeParam }),
                },
            });
            const data = response.data;

            const formatted: UiTransaction[] = data.map((t) => ({
                id: t.id,
                name: t.recipient,
                category: t.categoryName,
                amount: t.amount,
                icon: getIcon(t.categoryIcon),
                date: formatDaysAgo(t.date),
            }));
            setTransactions(formatted);
        } catch (err: any) {
            console.error("Error fetching transactions:", err);
            setError(err.message || 'Failed to fetch transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchTransactionsData();
    }, [fromDate, toDate, transactionType, userId]);

    const parseTransaction = (message: string) => {
        if (!userId) return;
        axioClient
            .post(`/users/${userId}/raw/transaction`, { message })
            .then((response) => {
                setParsedTransactionData(response.data);
                setShowConfirmTransactionModal(true);
            })
            .catch((error) => {
                console.error("Error parsing transaction:", error);
            });
    };

    const handleSuccess = () => {
        setShowConfirmTransactionModal(false);
        setShowEditCategoryModal(false);
        setShowDeleteModal(false); // Close delete modal on success
        void fetchTransactionsData(); // Re-fetch transactions after a successful add/confirm/edit/delete
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!userId) return;
        const file = event.target.files?.[0];
        if (file) {
            setUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result;
                axioClient.post(`/users/${userId}/transaction/extract`, { file: base64 })
                    .then(() => {
                        void fetchTransactionsData();
                    })
                    .catch((error) => {
                        console.error("Error uploading file:", error);
                    })
                    .finally(() => {
                        setUploading(false);
                    });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleEditClick = (transaction: UiTransaction) => {
        setTransactionToEdit(transaction);
        setShowEditCategoryModal(true);
    };

    const handleDeleteClick = (transaction: UiTransaction) => {
        setTransactionToDelete(transaction);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async (transactionId: string) => {
        if (!userId) return;
        try {
            await axioClient.delete(`/users/${userId}/transactions/${transactionId}`);
            handleSuccess(); // Refresh transactions and close modal
        } catch (err: any) {
            console.error("Error deleting transaction:", err);
            setError(err.message || "Failed to delete transaction.");
        }
    };

    return (
        <Card className="bg-card">
            {uploading && <LoadingOverlay message="AI is extracting transactions..." />}
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest spending activities</CardDescription>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="default"
                        onClick={() => setShowAddRawTransactionModal(true)}
                    >
                        Add Transaction
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleUploadClick}
                    >
                        Upload Bulk
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/pdf"
                    />
                </div>
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
                <EditTransactionCategoryModal
                    isOpen={showEditCategoryModal}
                    onClose={() => setShowEditCategoryModal(false)}
                    transaction={transactionToEdit}
                    onSuccess={handleSuccess}
                />
                <ConfirmDeleteTransactionModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    transaction={transactionToDelete}
                    onConfirm={handleConfirmDelete}
                />

                <ScrollArea className="h-[320px] pr-4">
                    {loading && <p>Loading...</p>}
                    {error && <p>Error: {error}</p>}
                    {!loading && !error && (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick} // Pass the handleDeleteClick function
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
