'use client'

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { Inbox, Plus, Trash2, X } from "lucide-react"
import {
    InvestmentTransaction,
    InvestmentTransactionType,
    Portfolio,
    RootState,
} from "@/Interfaces/Interfaces"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/ToastProvider"
import {
    createInvestmentTransaction,
    deleteInvestmentTransaction,
    getInvestmentTransactions,
    InvestmentTransactionPayload,
} from "@/components/api-calls/investment-transactions"
import { getPortfolios } from "@/components/api-calls/portfolios"
import { formatDateTime, formatMoney, formatUnits } from "./format"
import { InvestmentTypeBadge } from "./investment-type-badge"
import { InvestmentTransactionFormModal } from "./investment-transaction-form-modal"
import { TransactionListSkeleton } from "@/components/user-transactions-components/transaction-list-skeleton"

const toDateInput = (value: string | undefined): string => {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
}

export function InvestmentTransactionsList() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const reduxRange = useSelector((s: RootState) => s.dateRange)
    const userId = useSelector((s: RootState) => s.user.userId)
    const { showToast } = useToast()

    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [transactions, setTransactions] = useState<InvestmentTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<InvestmentTransaction | null>(null)

    const portfolioId = useMemo(() => {
        const v = searchParams.get("portfolioId")
        return v ? Number(v) : undefined
    }, [searchParams])

    const type = useMemo(() => {
        const v = searchParams.get("type") as InvestmentTransactionType | null
        return v ?? undefined
    }, [searchParams])

    const fromDate = searchParams.get("fromDate") ?? reduxRange.fromDate ?? undefined
    const toDate = searchParams.get("toDate") ?? reduxRange.toDate ?? undefined

    const updateQuery = useCallback(
        (patch: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(patch)) {
                if (value === undefined || value === "" || value === "ALL") {
                    params.delete(key)
                } else {
                    params.set(key, value)
                }
            }
            const qs = params.toString()
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
        },
        [searchParams, router, pathname],
    )

    const clearAllFilters = useCallback(() => {
        router.replace(pathname, { scroll: false })
    }, [router, pathname])

    const hasActiveFilter = useMemo(() => {
        return (
            searchParams.has("portfolioId") ||
            searchParams.has("type") ||
            searchParams.has("fromDate") ||
            searchParams.has("toDate")
        )
    }, [searchParams])

    useEffect(() => {
        if (!userId) return
        let cancelled = false
        getPortfolios(userId)
            .then((data) => {
                if (!cancelled) setPortfolios(data)
            })
            .catch((err) => console.error("Error fetching portfolios:", err))
        return () => {
            cancelled = true
        }
    }, [userId])

    useEffect(() => {
        if (!userId) return
        let cancelled = false
        setLoading(true)
        setError(null)
        getInvestmentTransactions(userId, {
            portfolioId,
            type,
            fromDate,
            toDate,
            sort: "transactionDate,desc",
            size: 100,
        })
            .then((data) => {
                if (cancelled) return
                setTransactions(data)
            })
            .catch((err: any) => {
                if (cancelled) return
                const message = err?.message || "Failed to load transactions"
                setError(message)
                showToast({
                    title: "Error",
                    description: message,
                    variant: "error",
                    duration: 5000,
                })
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [userId, portfolioId, type, fromDate, toDate, refreshKey, showToast])

    const portfolioName = (id: number) => portfolios.find((p) => p.id === id)?.name ?? "—"

    const handleCreate = async (payload: InvestmentTransactionPayload) => {
        if (!userId) return
        try {
            await createInvestmentTransaction(userId, payload)
            showToast({
                title: "Success!",
                description: "Transaction recorded.",
                variant: "success",
                duration: 5000,
            })
            setCreateOpen(false)
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message || "An error occurred while saving the transaction.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const confirmDelete = async () => {
        if (!userId || !deleteTarget) return
        setDeletingId(deleteTarget.id)
        try {
            await deleteInvestmentTransaction(userId, deleteTarget.id)
            showToast({
                title: "Success!",
                description: "Transaction deleted.",
                variant: "success",
                duration: 5000,
            })
            setDeleteTarget(null)
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message || "An error occurred while deleting.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Card className="bg-card">
            <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:flex-wrap">
                    <div className="grid gap-1.5 min-w-[180px]">
                        <Label htmlFor="tx-portfolio">Portfolio</Label>
                        <Select
                            value={portfolioId ? String(portfolioId) : "ALL"}
                            onValueChange={(value) =>
                                updateQuery({ portfolioId: value === "ALL" ? undefined : value })
                            }
                        >
                            <SelectTrigger id="tx-portfolio" className="w-full md:w-[200px]">
                                <SelectValue placeholder="All portfolios" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All portfolios</SelectItem>
                                {portfolios.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5 min-w-[140px]">
                        <Label htmlFor="tx-type">Type</Label>
                        <Select
                            value={type ?? "ALL"}
                            onValueChange={(value) =>
                                updateQuery({ type: value === "ALL" ? undefined : value })
                            }
                        >
                            <SelectTrigger id="tx-type" className="w-full md:w-[160px]">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All types</SelectItem>
                                <SelectItem value="BUY">Buy</SelectItem>
                                <SelectItem value="SELL">Sell</SelectItem>
                                <SelectItem value="INTEREST">Interest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="tx-from">From</Label>
                        <Input
                            id="tx-from"
                            type="date"
                            value={toDateInput(fromDate)}
                            onChange={(e) =>
                                updateQuery({
                                    fromDate: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                                })
                            }
                            className="w-full md:w-[160px]"
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="tx-to">To</Label>
                        <Input
                            id="tx-to"
                            type="date"
                            value={toDateInput(toDate)}
                            onChange={(e) =>
                                updateQuery({
                                    toDate: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined,
                                })
                            }
                            className="w-full md:w-[160px]"
                        />
                    </div>

                    {hasActiveFilter && (
                        <div className="md:ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="gap-1 text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                                Clear filters
                            </Button>
                        </div>
                    )}

                    <div className={hasActiveFilter ? "" : "md:ml-auto"}>
                        <Button onClick={() => setCreateOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Transaction
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    {loading
                        ? "Loading…"
                        : `${transactions.length} ${transactions.length === 1 ? "transaction" : "transactions"}`}
                </p>

                {loading ? (
                    <TransactionListSkeleton count={6} />
                ) : error ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        {error}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                        <Inbox className="h-10 w-10 opacity-50" />
                        <p className="text-sm">No investment transactions found.</p>
                        {hasActiveFilter && (
                            <p className="text-xs">Try clearing the filters above.</p>
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Portfolio</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Units</TableHead>
                                    <TableHead className="text-right">Price / unit</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[60px]">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="whitespace-nowrap text-xs">
                                            {formatDateTime(tx.transactionDate)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-foreground truncate max-w-[200px]">
                                                    {portfolioName(tx.portfolioId)}
                                                </span>
                                                <Badge variant="outline" className="font-mono w-fit">
                                                    {tx.tickerSymbol}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <InvestmentTypeBadge type={tx.type} />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatUnits(tx.units)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatMoney(tx.pricePerUnit)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums font-medium">
                                            {formatMoney(tx.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteTarget(tx)}
                                                aria-label="Delete transaction"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500/70" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <InvestmentTransactionFormModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                portfolios={portfolios}
                defaultPortfolioId={portfolioId}
                onSubmit={(payload) => void handleCreate(payload)}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the transaction
                            {deleteTarget
                                ? ` for ${portfolioName(deleteTarget.portfolioId)}`
                                : ""}
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                void confirmDelete()
                            }}
                            disabled={!!deletingId}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deletingId ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}