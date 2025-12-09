'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/user-transactions-components/add-transaction-modal";
import { BulkUploadModal } from "@/components/user-transactions-components/bulk-upload-modal";
import { ApiTransaction, AddTransaction, ParsedTransaction, RootState, UiTransaction } from "@/Interfaces/Interfaces";
import { useSelector } from "react-redux";
import { TransactionItem } from "@/components/user-transactions-components/transaction-item";
import { useEffect, useState } from 'react';
import axioClient from '@/utils/axioClient';
import { getIcon, formatDaysAgo } from '@/utils/helpers';
import ConfirmTransactionModal from "@/components/user-transactions-components/confrim-transaction";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { EditTransactionCategoryModal } from "@/components/user-transactions-components/edit-transaction-category-modal";
import { ConfirmDeleteTransactionModal } from "@/components/user-transactions-components/confirm-delete-transaction-modal";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TransactionListBaseProps {
    title: string;
    description: string;
    limit?: number;
    showAutoCategorizeButton?: boolean;
    children?: React.ReactNode;
}

export function TransactionListBase({ title, description, limit, showAutoCategorizeButton, children }: TransactionListBaseProps) {
    const { fromDate, toDate, transactionType } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [transactions, setTransactions] = useState<UiTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddRawTransactionModal, setShowAddRawTransactionModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false);
    const [parsedTransactionData, setParsedTransactionData] = useState<ParsedTransaction[]>([]);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<UiTransaction | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<UiTransaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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
                    ...(limit && { limit }),
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
    }, [fromDate, toDate, transactionType, limit, userId]);

    const addTransaction = (transaction: AddTransaction) => {
        if (!userId) return;
        setUploading(true);
        axioClient
            .post(`/users/${userId}/transactions`, [transaction])
            .then(() => {
                void fetchTransactionsData();
                setShowAddRawTransactionModal(false);
            })
            .catch((error) => {
                console.error("Error adding transaction:", error);
            })
            .finally(() => {
                setUploading(false);
            });
    };

    const handleSuccess = () => {
        setShowConfirmTransactionModal(false);
        setShowEditCategoryModal(false);
        setShowDeleteModal(false);
        void fetchTransactionsData();
    }

    const handleFileSubmit = (file: File) => {
        if (!userId) return;

        setUploading(true);
        setShowBulkUploadModal(false);

        const formData = new FormData();
        formData.append("pdfFile", file);

        axioClient.post(
            "http://localhost:3000/api/ai/statement/",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )
            .then((response) => {
                const data = response.data;
                const transactionsArray = Array.isArray(data) ? data : [data];
                setParsedTransactionData(transactionsArray);
                setShowConfirmTransactionModal(true);
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
            })
            .finally(() => {
                setUploading(false);
            });
    };


    const handleTextSubmit = (rawMessage: string) => {
        if (!userId) return;
        setUploading(true);
        setShowBulkUploadModal(false);
        axioClient
            .post(`http://localhost:3000/api/raw-text/ai`, { messages: rawMessage })
            .then((response) => {
                const data = response.data;
                console.log(data)
                const transactionsArray = Array.isArray(data) ? data : [data];
                setParsedTransactionData(transactionsArray);
                setShowConfirmTransactionModal(true);
            })
            .catch((error) => {
                console.error("Error processing bulk transactions:", error);
            })
            .finally(() => {
                setUploading(false);
            });
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
            handleSuccess();
        } catch (err: any) {
            console.error("Error deleting transaction:", err);
            setError(err.message || "Failed to delete transaction.");
        }
    };

    const handleAutoCategorize = async () => {
        if (!userId) return;
        setIsCategorizing(true);
        try {
            await axioClient.post(`/users/${userId}/categorize`, {});
            await fetchTransactionsData();
        } catch (error) {
            console.error("Error during auto-categorization:", error);
            setError("Failed to auto-categorize transactions.");
        } finally {
            setIsCategorizing(false);
        }
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card className="bg-card">
            {(uploading || isCategorizing || loading) && <LoadingOverlay message={isCategorizing ? "Auto-categorizing transactions..." : uploading ? "AI is extracting transactions..." : "Loading..."} />}
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search transactions..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {showAutoCategorizeButton && (
                        <Button variant="outline" onClick={handleAutoCategorize} disabled={isCategorizing}>
                            {isCategorizing ? 'Working...' : 'Auto-Categorize'}
                        </Button>
                    )}

                    <Button
                        variant="default"
                        onClick={() => setShowAddRawTransactionModal(true)}
                    >
                        Add Transaction
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowBulkUploadModal(true)}
                    >
                        Upload Bulk
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <AddTransactionModal
                    isOpen={showAddRawTransactionModal}
                    onClose={() => setShowAddRawTransactionModal(false)}
                    onSubmit={addTransaction}
                    isLoading={uploading}
                />
                <BulkUploadModal
                    isOpen={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    onTextSubmit={handleTextSubmit}
                    onFileSubmit={handleFileSubmit}
                    isLoading={uploading}
                />
                {parsedTransactionData.length > 0 && (
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
                    onConfirm={() => transactionToDelete && handleConfirmDelete(transactionToDelete.id)}
                />

                <ScrollArea className="h-[320px] pr-4">
                    {error && <p>Error: {error}</p>}
                    {!loading && !error && filteredTransactions.length === 0 && (
                        <p className="text-center text-muted-foreground">No transactions found.</p>
                    )}
                    {!loading && !error && filteredTransactions.length > 0 && (
                        <div className="space-y-3">
                            {filteredTransactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction.id}
                                    transaction={transaction}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {children}
            </CardContent>
        </Card>
    )
}
