'use client'

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Portfolio,
    InvestmentTransaction,
    InvestmentTransactionQuery,
    InvestmentTransactionType,
    RootState,
} from "@/Interfaces/Interfaces"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Plus, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight, Search, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/ToastProvider"
import { PortfolioForm } from "@/components/portfolio/portfolio-form"
import { ConfirmDeletePortfolioModal } from "@/components/portfolio/confirm-delete-portfolio-modal"
import { InvestmentTransactionForm } from "@/components/portfolio/investment-transaction-form"
import {
    createPortfolio,
    deletePortfolio,
    getPortfolios,
    updatePortfolio,
} from "@/components/api-calls/portfolios"
import {
    createInvestmentTransaction,
    deleteInvestmentTransaction,
    getInvestmentTransactions,
    InvestmentTransactionPayload,
} from "@/components/api-calls/investment-transactions"
import { Badge } from "@/components/ui/badge"
import { usePortfolioTypes } from "@/hooks/use-portfolio-types"

const formatMoney = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0.00"
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatUnits = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "0"
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function PortfoliosList() {
    const userId = useSelector((state: RootState) => state.user.userId)
    const { showToast } = useToast()
    usePortfolioTypes()

    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Per-portfolio transactions expansion
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [txByPortfolio, setTxByPortfolio] = useState<Record<number, InvestmentTransaction[]>>({})
    const [txLoading, setTxLoading] = useState<Record<number, boolean>>({})
    const [txFilter, setTxFilter] = useState<Record<number, InvestmentTransactionQuery>>({})
    const [txFormOpen, setTxFormOpen] = useState<number | null>(null)

    const fetchPortfolios = async () => {
        if (!userId) return
        const fetched = await getPortfolios(userId)
        setPortfolios(fetched)
    }

    useEffect(() => {
        void fetchPortfolios()
    }, [userId])

    const fetchTransactionsFor = async (portfolioId: number, override?: InvestmentTransactionQuery) => {
        if (!userId) return
        const filter = override ?? txFilter[portfolioId] ?? {}
        setTxLoading((prev) => ({ ...prev, [portfolioId]: true }))
        const txs = await getInvestmentTransactions(userId, {
            portfolioId,
            ...filter,
            sort: filter.sort ?? "transactionDate,desc",
            size: filter.size ?? 100,
        })
        setTxByPortfolio((prev) => ({ ...prev, [portfolioId]: txs }))
        setTxLoading((prev) => ({ ...prev, [portfolioId]: false }))
    }

    const toggleExpand = async (portfolio: Portfolio) => {
        const isOpen = expandedId === portfolio.id
        setExpandedId(isOpen ? null : portfolio.id)
        if (!isOpen && !txByPortfolio[portfolio.id]) {
            await fetchTransactionsFor(portfolio.id)
        }
    }

    const filteredPortfolios = useMemo(() => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return portfolios
        return portfolios.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.tickerSymbol.toLowerCase().includes(q) ||
                (p.broker ?? "").toLowerCase().includes(q)
        )
    }, [portfolios, searchQuery])

    const handleAdd = () => {
        setSelectedPortfolio(null)
        setIsFormOpen(true)
    }

    const handleEdit = (portfolio: Portfolio) => {
        setSelectedPortfolio(portfolio)
        setIsFormOpen(true)
    }

    const handleDelete = (portfolio: Portfolio) => {
        setDeleteTarget(portfolio)
    }

    const confirmDelete = async () => {
        if (!userId || !deleteTarget) return
        setDeleting(true)
        try {
            await deletePortfolio(userId, deleteTarget.id)
            showToast({
                title: "Success!",
                description: `${deleteTarget.name} portfolio has been deleted.`,
                variant: "success",
                duration: 5000,
            })
            setDeleteTarget(null)
            if (expandedId === deleteTarget.id) setExpandedId(null)
            await fetchPortfolios()
        } catch (error: any) {
            showToast({
                title: "Error!",
                description:
                    error?.response?.data?.message || "An error occurred while deleting.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setDeleting(false)
        }
    }

    const handleSubmitPortfolio = async (payload: Partial<Portfolio>) => {
        if (!userId) return
        try {
            if (payload.id) {
                await updatePortfolio(userId, payload.id, {
                    name: payload.name!,
                    tickerSymbol: payload.tickerSymbol!,
                    broker: payload.broker,
                    totalUnits: payload.totalUnits,
                    totalCostBasis: payload.totalCostBasis,
                    currentValue: payload.currentValue,
                    typeId: payload.typeId,
                })
                showToast({
                    title: "Success!",
                    description: "Your portfolio has been updated.",
                    variant: "success",
                    duration: 5000,
                })
            } else {
                await createPortfolio(userId, {
                    name: payload.name!,
                    tickerSymbol: payload.tickerSymbol!,
                    broker: payload.broker,
                    totalUnits: payload.totalUnits,
                    totalCostBasis: payload.totalCostBasis,
                    currentValue: payload.currentValue,
                    typeId: payload.typeId,
                })
                showToast({
                    title: "Success!",
                    description: "Your portfolio has been saved.",
                    variant: "success",
                    duration: 5000,
                })
            }
            await fetchPortfolios()
            setIsFormOpen(false)
        } catch (error: any) {
            showToast({
                title: "Error!",
                description:
                    error?.response?.data?.message || "An error occurred while saving your portfolio.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const handleCreateTransaction = async (
        portfolioId: number,
        payload: InvestmentTransactionPayload
    ) => {
        if (!userId) return
        try {
            await createInvestmentTransaction(userId, payload)
            showToast({
                title: "Success!",
                description: "Transaction recorded.",
                variant: "success",
                duration: 5000,
            })
            setTxFormOpen(null)
            await fetchTransactionsFor(portfolioId)
            await fetchPortfolios()
        } catch (error: any) {
            showToast({
                title: "Error!",
                description:
                    error?.response?.data?.message || "An error occurred while saving the transaction.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const handleDeleteTransaction = async (portfolioId: number, transactionId: string) => {
        if (!userId) return
        try {
            await deleteInvestmentTransaction(userId, transactionId)
            showToast({
                title: "Success!",
                description: "Transaction deleted.",
                variant: "success",
                duration: 5000,
            })
            await fetchTransactionsFor(portfolioId)
            await fetchPortfolios()
        } catch (error: any) {
            showToast({
                title: "Error!",
                description:
                    error?.response?.data?.message || "An error occurred while deleting.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const updateTxFilter = async (portfolioId: number, patch: InvestmentTransactionQuery) => {
        const merged: InvestmentTransactionQuery = {
            ...(txFilter[portfolioId] ?? {}),
            ...patch,
        }
        setTxFilter((prev) => ({ ...prev, [portfolioId]: merged }))
        await fetchTransactionsFor(portfolioId, merged)
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-8 max-w-7xl">
            <Card className="px-4 sm:px-8">
                <CardHeader className="space-y-1 pb-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                Portfolios
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base mt-1.5">
                                Manage your investment portfolios and transactions
                            </CardDescription>
                        </div>
                        <Button onClick={handleAdd} size="default" className="gap-2 mt-4 sm:mt-0">
                            <Plus className="h-4 w-4" />
                            <span className="sm:inline">Add Portfolio</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center mb-6 flex-wrap gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search portfolios..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="mx-5">
                            <p className="text-muted-foreground text-sm">
                                You have {portfolios.length} {portfolios.length === 1 ? "portfolio" : "portfolios"}
                            </p>
                        </div>
                    </div>

                    {filteredPortfolios.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {portfolios.length === 0
                                ? "No portfolios yet. Start by adding a new portfolio to track your investments."
                                : "No portfolios match your search."}
                        </div>
                    ) : (
                        <Table className="rounded-lg">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border">
                                    <TableHead className="w-[40px]" />
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold hidden sm:table-cell">Ticker</TableHead>
                                    <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                                    <TableHead className="font-semibold hidden md:table-cell">Broker</TableHead>
                                    <TableHead className="font-semibold hidden lg:table-cell text-right">Units</TableHead>
                                    <TableHead className="font-semibold hidden lg:table-cell text-right">Cost Basis</TableHead>
                                    <TableHead className="font-semibold text-right">Current Value</TableHead>
                                    <TableHead className="w-[70px]">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPortfolios.map((portfolio) => {
                                    const isExpanded = expandedId === portfolio.id
                                    const txs = txByPortfolio[portfolio.id] ?? []
                                    const loadingTxs = txLoading[portfolio.id]
                                    const filter = txFilter[portfolio.id] ?? {}
                                    return (
                                        <React.Fragment key={portfolio.id}>
                                            <TableRow className="hover:bg-transparent border">
                                                <TableCell className="w-[40px]">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => void toggleExpand(portfolio)}
                                                        aria-label={
                                                            isExpanded ? "Collapse transactions" : "Expand transactions"
                                                        }
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="font-medium whitespace-pre-wrap break-words">
                                                    {portfolio.name}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline" className="font-mono">
                                                        {portfolio.tickerSymbol}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {portfolio.typeName ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className={portfolio.typeActive === false ? "opacity-60" : ""}
                                                        >
                                                            {portfolio.typeName}
                                                            {portfolio.typeActive === false && " (inactive)"}
                                                        </Badge>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {portfolio.broker || "—"}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-right tabular-nums">
                                                    {formatUnits(portfolio.totalUnits)}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-right tabular-nums">
                                                    {formatMoney(portfolio.totalCostBasis)}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-semibold">
                                                    {formatMoney(portfolio.currentValue)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEdit(portfolio)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setTxFormOpen(portfolio.id)
                                                                    setExpandedId(portfolio.id)
                                                                    if (!txByPortfolio[portfolio.id]) {
                                                                        void fetchTransactionsFor(portfolio.id)
                                                                    }
                                                                }}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add Transaction
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => handleDelete(portfolio)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow className="hover:bg-transparent border">
                                                    <TableCell colSpan={9} className="bg-muted/20 p-0">
                                                        <PortfolioTransactionsPanel
                                                            portfolio={portfolio}
                                                            transactions={txs}
                                                            loading={loadingTxs}
                                                            filter={filter}
                                                            onFilterChange={(patch) =>
                                                                void updateTxFilter(portfolio.id, patch)
                                                            }
                                                            onAdd={() => setTxFormOpen(portfolio.id)}
                                                            onDelete={(txId) =>
                                                                void handleDeleteTransaction(portfolio.id, txId)
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}

                    <PortfolioForm
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={handleSubmitPortfolio}
                        portfolio={selectedPortfolio}
                    />

                    <ConfirmDeletePortfolioModal
                        isOpen={!!deleteTarget}
                        onClose={() => setDeleteTarget(null)}
                        portfolioName={deleteTarget?.name ?? ""}
                        loading={deleting}
                        onConfirm={() => void confirmDelete()}
                    />

                    {txFormOpen !== null && (
                        <InvestmentTransactionForm
                            isOpen={txFormOpen !== null}
                            onClose={() => setTxFormOpen(null)}
                            portfolio={
                                portfolios.find((p) => p.id === txFormOpen) ?? null
                            }
                            onSubmit={(payload) =>
                                txFormOpen !== null &&
                                void handleCreateTransaction(txFormOpen, payload)
                            }
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

interface PanelProps {
    portfolio: Portfolio
    transactions: InvestmentTransaction[]
    loading?: boolean
    filter: InvestmentTransactionQuery
    onFilterChange: (patch: InvestmentTransactionQuery) => void
    onAdd: () => void
    onDelete: (id: string) => void
}

function PortfolioTransactionsPanel({
    portfolio,
    transactions,
    loading,
    filter,
    onFilterChange,
    onAdd,
    onDelete,
}: PanelProps) {
    return (
        <div className="px-4 sm:px-6 py-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h4 className="text-sm font-semibold text-foreground">
                        {portfolio.name} transactions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
                    </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    <Select
                        value={filter.type ?? "ALL"}
                        onValueChange={(value) =>
                            onFilterChange({
                                type:
                                    value === "ALL"
                                        ? undefined
                                        : (value as InvestmentTransactionType),
                            })
                        }
                    >
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All types</SelectItem>
                            <SelectItem value="BUY">Buy</SelectItem>
                            <SelectItem value="SELL">Sell</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="sm" onClick={onAdd} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading…</div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                    No transactions yet for this portfolio.
                </div>
            ) : (
                <div className="rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Units</TableHead>
                                <TableHead className="text-right">Price / unit</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="hidden md:table-cell">Notes</TableHead>
                                <TableHead className="w-[60px]">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id} className="hover:bg-transparent">
                                    <TableCell className="whitespace-nowrap text-xs">
                                        {formatDateTime(tx.transactionDate)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={tx.type === "BUY" ? "default" : "secondary"}
                                            className="gap-1"
                                        >
                                            {tx.type === "BUY" ? (
                                                <ArrowDownRight className="h-3 w-3" />
                                            ) : (
                                                <ArrowUpRight className="h-3 w-3" />
                                            )}
                                            {tx.type}
                                        </Badge>
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
                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                        {tx.notes || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(tx.id)}
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
        </div>
    )
}