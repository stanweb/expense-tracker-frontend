'use client'

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/user-transactions-components/add-transaction-modal";
import { BulkUploadModal } from "@/components/user-transactions-components/bulk-upload-modal";
import { ApiTransaction, AddTransaction, ParsedTransaction, RootState, UiTransaction } from "@/Interfaces/Interfaces";
import { useDispatch, useSelector } from "react-redux";
import { TransactionItem } from "@/components/user-transactions-components/transaction-item";
import { useEffect, useState } from 'react';
import axioClient from '@/utils/apiClient';
import { getIcon, formatDaysAgo } from '@/utils/helpers';
import ConfirmTransactionModal from "@/components/user-transactions-components/confrim-transaction";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { EditTransactionCategoryModal } from "@/components/user-transactions-components/edit-transaction-category-modal";
import { ConfirmDeleteTransactionModal } from "@/components/user-transactions-components/confirm-delete-transaction-modal";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, Upload, Sparkles, X, Inbox, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import aiAxioClient from "@/utils/apiClient";
import { addJob, clearJob } from '@/store/jobs-slice';
import axiosClient from "@/utils/apiClient";
import {setTransactionTrigger, setRange} from "@/store/date-slice";
import { useToast} from "@/components/ui/ToastProvider";
import Link from "next/link";

interface TransactionListBaseProps {
    title?: string;
    description?: string;
    limit?: number;
    paginate?: boolean;
    pageSize?: number;
    showAutoCategorizeButton?: boolean;
    variant?: 'dashboard' | 'full';
    children?: React.ReactNode;
}

export function TransactionListBase({ title, description, limit, paginate = false, pageSize = 25, showAutoCategorizeButton, variant = 'full', children }: TransactionListBaseProps) {
    const isDashboard = variant === 'dashboard';
    const { fromDate, toDate, transactionType, transactionTrigger } = useSelector((state: RootState) => state.dateRange);
    const userId = useSelector((state: RootState) => state.user.userId);
    const jobs = useSelector((state: RootState) => state.jobs);
    const dispatch = useDispatch();
    const [allTransactions, setAllTransactions] = useState<UiTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [showAddRawTransactionModal, setShowAddRawTransactionModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false);
    const [parsedTransactionData, setParsedTransactionData] = useState<ParsedTransaction[]>([]);
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<UiTransaction | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<UiTransaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const {showToast} = useToast()

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

            // Server-side pagination isn't supported on this endpoint, so we
            // always fetch the full list. When `paginate` is true, the page
            // state is applied client-side below.
            const response = await axioClient.get(`/users/${userId}/transactions`, {
                params: {
                    from: fromDate ?? '',
                    to: toDate ?? '',
                    ...(limit && { limit }),
                    ...(typeParam && { type: typeParam }),
                },
            });
            const data = response.data;
            const rows: ApiTransaction[] = Array.isArray(data) ? data : (data?.content ?? []);

            const formatted: UiTransaction[] = rows.map((t) => ({
                id: t.id,
                name: t.recipient,
                category: t.categoryName,
                amount: t.amount,
                icon: getIcon(t.categoryIcon),
                date: formatDaysAgo(t.date),
                rawDate: t.date,
            }));
            setAllTransactions(formatted);
        } catch (err: any) {
            console.error("Error fetching transactions:", err);
            setError(err.message || 'Failed to fetch transactions');
            setAllTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Reset to first page whenever filters change. Page changes are
        // handled client-side, so the effect doesn't depend on `page`.
        setPage(0);
        void fetchTransactionsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate, transactionType, limit, userId, transactionTrigger]);

    useEffect(() => {
        if (jobs.length > 0) {
            const interval = setInterval(() => {
                axiosClient.get(`/jobs/${jobs[0].jobId}`)
                    .then(response => {
                        const { status } = response.data;
                        if (status === 'COMPLETED') {
                            dispatch(setTransactionTrigger(Date.now().toString()))
                            dispatch(clearJob());
                            clearInterval(interval);
                        } else if (status === 'FAILED') {
                            dispatch(clearJob());
                            clearInterval(interval);
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching job status:", error);
                        dispatch(clearJob());
                        clearInterval(interval);
                    });
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [jobs, dispatch]);

    const addTransaction = (transaction: AddTransaction) => {
        if (!userId) return;
        setLoading(true)
        axioClient
            .post(`/users/${userId}/transactions`, [transaction])
            .then(() => {
                if (paginate) setPage(0);
                void fetchTransactionsData();
                setShowAddRawTransactionModal(false);
                showToast({
                    title: 'Success',
                    duration: 4000,
                    variant: 'success',
                    description: 'Successfully added transaction'
                })
            })
            .catch((error: any) => {
                showToast({
                    title: "Error!",
                    description: error.response.data.message || "An error occurred while saving your category",
                    variant: "error",
                    duration: 5000,
                })
            })
            .finally(()=> {
                setLoading(false)
            })
    };

    const handleSuccess = () => {
        setShowConfirmTransactionModal(false);
        setShowEditCategoryModal(false);
        setShowDeleteModal(false);
        if (paginate) setPage(0);
        void fetchTransactionsData();
    }

    const handleFileSubmit = (file: File) => {
        if (!userId) return;

        setShowBulkUploadModal(false);

        const formData = new FormData();
        formData.append("pdfFile", file);

        aiAxioClient.post(
            "/ai/statement/",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )
            .then((response) => {
                const { jobId, status } = response.data;
                dispatch(addJob({ jobId, status }));
                showToast({
                    title: 'Success',
                    duration: 4000,
                    variant: 'success',
                    description: 'PDF uploaded successfully'
                })
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
                showToast({
                    title: "Error!",
                    description: error.response.data.message || "An error occurred while saving your category.",
                    variant: "error",
                    duration: 5000,
                })
            })
            .finally(()=> {
                setLoading(false)
            })
    };


    const handleTextSubmit = (rawMessage: string) => {
        if (!userId) return;
        setShowBulkUploadModal(false);
        setLoading(true)

        aiAxioClient
            .post(`ai/raw-text`, { messages: rawMessage })
            .then((response) => {
                const data = response.data;

                const transactionsArray = Array.isArray(data) ? data : [data];
                setParsedTransactionData(transactionsArray);
                setShowConfirmTransactionModal(true);
                showToast({
                    title: 'Success',
                    duration: 4000,
                    variant: 'success',
                    description: 'Successfully processed transactions'
                })
            })
            .catch((error) => {
                showToast({
                    title: "Error!",
                    description: error.response.data.message || "An error occurred while saving your category",
                    variant: "error",
                    duration: 5000,
                })
            })
            .finally(()=>{
                setLoading(false)
            })
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
            showToast({
                title: "Success!",
                description: "Your transaction has been deleted.",
                variant: "success",
                duration: 5000,
            })
        } catch (error: any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while deleting",
                variant: "error",
                duration: 5000,
            })
            setError(error.message || "Failed to delete transaction.");
        }
    };

    const handleAutoCategorize = async () => {
        if (!userId) return;
        setIsCategorizing(true);
        try {
            await axioClient.post(`/users/${userId}/transactions/categorize`, {});
            showToast({
                title: "Success!",
                description: "Your transactions have been categorized.",
                variant: "success",
                duration: 5000,
            })
            await fetchTransactionsData();
        } catch (error: any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while auto-categorizing",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setIsCategorizing(false);
        }
    };

    const getLoadingMessage = () => {
        if (jobs.length>0) return "AI is processing your document...";
        if (isCategorizing) return "Auto-categorizing transactions...";
        if (loading) return "Loading...";
        return "Loading..."
    };



    const filteredTransactions = allTransactions.filter(transaction =>
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply client-side pagination. When `paginate` is false (e.g. dashboard
    // "Recent Transactions"), the full filtered list is shown.
    const displayedTransactions = paginate
        ? filteredTransactions.slice(page * pageSize, (page + 1) * pageSize)
        : filteredTransactions;

    // Dashboard summary: count + sum of the displayed rows.
    const dashboardSummaryCount = isDashboard ? displayedTransactions.length : 0;
    const dashboardSummaryTotal = isDashboard
        ? displayedTransactions.reduce((acc, t) => acc + (t.amount || 0), 0)
        : 0;
    const dashboardSummaryLabel = isDashboard && dashboardSummaryCount > 0
        ? `${dashboardSummaryCount} ${dashboardSummaryCount === 1 ? 'transaction' : 'transactions'} · ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(dashboardSummaryTotal)}`
        : '';

    const hasActiveFilters = !!fromDate || !!toDate || transactionType !== 'all' || !!searchQuery;
    const hasNoDataAtAll = !loading && !error && allTransactions.length === 0 && !hasActiveFilters;
    const isFilteredEmpty = !loading && !error && allTransactions.length > 0 && filteredTransactions.length === 0;
    const isEmptyInRange = !loading && !error && allTransactions.length === 0 && hasActiveFilters;

    const handleClearFilters = () => {
        setSearchQuery('');
        dispatch(setRange({
            fromDate: null,
            toDate: null,
            transactionType: 'all',
            transactionTrigger: Date.now().toString(),
        }));
    };

    // ---- Pagination (client-side) ----
    // totalPages is computed from the post-search filtered list. The
    // dashboard's `RecentTransactionsList` doesn't paginate, so totalPages
    // is 1 and the controls are hidden.
    const totalPages = paginate ? Math.max(1, Math.ceil(filteredTransactions.length / pageSize)) : 1;
    const startIndex = paginate && displayedTransactions.length > 0 ? page * pageSize + 1 : 0;
    const endIndex = paginate && displayedTransactions.length > 0
        ? page * pageSize + displayedTransactions.length
        : 0;
    const showingLabel = paginate
        ? (displayedTransactions.length > 0
            ? `Showing ${startIndex}–${endIndex} of ${filteredTransactions.length}`
            : '')
        : '';

    // Page-number list with ellipsis. Always show 1 and the last page if they exist,
    // plus page ± 1 around the current page.
    const pageNumbers = (() => {
        if (!paginate) return [] as number[];
        const current = page + 1; // 1-based
        const last = totalPages;
        const set = new Set<number>([1, last, current - 1, current, current + 1]);
        return Array.from(set)
            .filter((n) => n >= 1 && n <= last)
            .sort((a, b) => a - b);
    })();

    const buildPageList = (): Array<number | 'ellipsis'> => {
        const list: Array<number | 'ellipsis'> = [];
        for (let i = 0; i < pageNumbers.length; i++) {
            if (i > 0 && pageNumbers[i] - pageNumbers[i - 1] > 1) {
                list.push('ellipsis');
            }
            list.push(pageNumbers[i]);
        }
        return list;
    };

    return (
        <Card className="bg-card overflow-hidden">
            {(isCategorizing || loading || !!jobs[0]?.jobId) && <LoadingOverlay message={getLoadingMessage()} />}
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {title && (
                    <div className="space-y-1">
                        <CardTitle>{title}</CardTitle>
                        {isDashboard ? (
                            <p className="text-sm text-muted-foreground">{dashboardSummaryLabel}</p>
                        ) : (
                            description && <CardDescription>{description}</CardDescription>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isDashboard ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-primary hover:text-primary"
                        >
                            <Link href="/all-transactions">
                                View all
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search transactions..."
                                    aria-label="Search transactions"
                                    className="pl-9 pr-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape' && searchQuery) {
                                            setSearchQuery('');
                                        }
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear search"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {showAutoCategorizeButton && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="sm:hidden"
                                        onClick={handleAutoCategorize}
                                        disabled={isCategorizing}
                                        aria-label="Auto Categorize"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden sm:flex"
                                        onClick={handleAutoCategorize}
                                        disabled={isCategorizing}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {isCategorizing ? 'Categorizing…' : 'Auto Categorize'}
                                    </Button>
                                </>
                            )}

                            <Button
                                variant="default"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => setShowAddRawTransactionModal(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="default"
                                className="hidden sm:flex"
                                onClick={() => setShowAddRawTransactionModal(true)}
                            >
                                Add Transaction
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => setShowBulkUploadModal(true)}
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden sm:flex"
                                onClick={() => setShowBulkUploadModal(true)}
                            >
                                Upload Bulk
                            </Button>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-col min-h-0">
                <AddTransactionModal
                    isOpen={showAddRawTransactionModal}
                    onClose={() => setShowAddRawTransactionModal(false)}
                    onSubmit={addTransaction}
                    isLoading={loading}
                />
                <BulkUploadModal
                    isOpen={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    onTextSubmit={handleTextSubmit}
                    onFileSubmit={handleFileSubmit}
                    isLoading={!!jobs[0]?.jobId}
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
                    onConfirm={() => transactionToDelete && handleConfirmDelete(transactionToDelete.id.toString())}
                />

                <div className={isDashboard ? 'max-h-[420px] flex flex-col overflow-y-auto' : 'flex-1 min-h-0'}>
                    {isDashboard ? (
                        <>
                            {loading && (
                                <div className="space-y-3 py-2" aria-busy="true" aria-label="Loading transactions">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2">
                                            <Skeleton className="h-9 w-9 rounded-md" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-3.5 w-1/3" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {error && !loading && (
                                <Alert variant="destructive" className="py-2 my-2">
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}
                            {!loading && !error && hasNoDataAtAll && (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                    <Receipt className="h-10 w-10 text-muted-foreground/50" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">No transactions yet.</p>
                                        <p className="text-xs text-muted-foreground">Add your first transaction to get started.</p>
                                    </div>
                                </div>
                            )}
                            {!loading && !error && displayedTransactions.length > 0 && (
                                <div role="list" className="divide-y divide-border/60">
                                    {displayedTransactions.map((transaction) => (
                                        <TransactionItem
                                            key={transaction.id}
                                            transaction={transaction}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteClick}
                                            compact
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <ScrollArea className="max-h-[70vh]">
                            {loading && (
                                <div className="space-y-3" aria-busy="true" aria-label="Loading transactions">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 border border-border/60 rounded-lg">
                                            <Skeleton className="h-10 w-10 rounded-md" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {error && (
                                <Alert variant="destructive" className="py-2">
                                    <AlertDescription className="text-sm">{error}</AlertDescription>
                                </Alert>
                            )}
                            {!loading && !error && hasNoDataAtAll && (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <Receipt className="h-10 w-10 text-muted-foreground/50" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">No transactions yet.</p>
                                        <p className="text-xs text-muted-foreground">Add your first transaction or upload a statement to get started.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <Button size="sm" onClick={() => setShowAddRawTransactionModal(true)}>
                                            <Plus className="h-4 w-4" />
                                            Add transaction
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setShowBulkUploadModal(true)}>
                                            <Upload className="h-4 w-4" />
                                            Upload statement
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!loading && !error && isFilteredEmpty && (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">No transactions match your search.</p>
                                        <p className="text-xs text-muted-foreground">Try a different keyword or clear the search.</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
                                        <X className="h-4 w-4" />
                                        Clear search
                                    </Button>
                                </div>
                            )}
                            {!loading && !error && isEmptyInRange && (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-foreground">No transactions in this range.</p>
                                        <p className="text-xs text-muted-foreground">Try widening the date range or clearing the active filters.</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={handleClearFilters}>
                                        <X className="h-4 w-4" />
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                            {!loading && !error && displayedTransactions.length > 0 && (
                                <div className="space-y-3">
                                    {displayedTransactions.map((transaction) => (
                                        <TransactionItem
                                            key={transaction.id}
                                            transaction={transaction}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                </div>
                            )}
                            {!loading && !error && paginate && filteredTransactions.length > 0 && displayedTransactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                                    <p className="text-sm">No transactions on this page.</p>
                                    <Button size="sm" variant="outline" onClick={() => setPage(0)}>
                                        Go to first page
                                    </Button>
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>

                {isDashboard && !loading && !error && (
                    <div className="mt-auto pt-3 flex items-center justify-end gap-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBulkUploadModal(true)}
                            disabled={!!jobs[0]?.jobId}
                        >
                            <Upload className="h-4 w-4" />
                            Upload statement
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowAddRawTransactionModal(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add transaction
                        </Button>
                    </div>
                )}

                {paginate && (
                    <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                        <p className="text-xs text-muted-foreground">{showingLabel}</p>
                        <nav aria-label="Pagination" className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0 || loading}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>
                            {buildPageList().map((item, idx) =>
                                item === 'ellipsis' ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        aria-hidden
                                        className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                                    >
                                        …
                                    </span>
                                ) : (
                                    <Button
                                        key={item}
                                        variant={item === page + 1 ? 'outline' : 'ghost'}
                                        size="icon"
                                        onClick={() => setPage(item - 1)}
                                        disabled={loading}
                                        aria-current={item === page + 1 ? 'page' : undefined}
                                        aria-label={`Go to page ${item}`}
                                    >
                                        {item}
                                    </Button>
                                )
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={loading || page + 1 >= totalPages}
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </nav>
                    </div>
                )}

                {children}
            </CardContent>
        </Card>
    )
}
