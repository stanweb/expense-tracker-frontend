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
    RootState,
} from "@/Interfaces/Interfaces"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import Link from "next/link"
import {
    Plus, MoreHorizontal, Pencil, Trash2, Search,
    ArrowUpRight, ArrowDownRight, ScrollText
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/ToastProvider"
import { PortfolioForm } from "@/components/portfolio/portfolio-form"
import { ConfirmDeletePortfolioModal } from "@/components/portfolio/confirm-delete-portfolio-modal"
import { formatMoney, formatUnits } from "@/components/portfolio/format"
import {
    createPortfolio,
    deletePortfolio,
    getPortfolios,
    updatePortfolio,
} from "@/components/api-calls/portfolios"
import { Badge } from "@/components/ui/badge"
import { usePortfolioTypes } from "@/hooks/use-portfolio-types"
import { PortfolioAnalytics } from "@/components/portfolio/portfolio-analytics"
import { PortfoliosTableSkeleton } from "@/components/portfolio/portfolios-table-skeleton"

const computeGainPct = (currentValue: string | number | null | undefined, costBasis: string | number | null | undefined) => {
    const value = Number(currentValue ?? 0)
    const cost = Number(costBasis ?? 0)
    if (!Number.isFinite(value) || !Number.isFinite(cost) || cost <= 0) return null
    return ((value - cost) / cost) * 100
}

const formatGainPct = (pct: number | null) => {
    if (pct === null) return "—"
    const sign = pct > 0 ? "+" : ""
    return `${sign}${pct.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}%`
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
    const [loading, setLoading] = useState(true)

    const fetchPortfolios = async () => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const fetched = await getPortfolios(userId)
            setPortfolios(fetched)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchPortfolios()
    }, [userId])

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
                                Manage your investment portfolios
                            </CardDescription>
                        </div>
                        <Button onClick={handleAdd} size="default" className="gap-2 mt-4 sm:mt-0">
                            <Plus className="h-4 w-4" />
                            <span className="sm:inline">Add Portfolio</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PortfolioAnalytics portfolios={portfolios} />

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

                    {loading ? (
                        <PortfoliosTableSkeleton count={5} />
                    ) : filteredPortfolios.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {portfolios.length === 0
                                ? "No portfolios yet. Start by adding a new portfolio to track your investments."
                                : "No portfolios match your search."}
                        </div>
                    ) : (
                        <Table className="rounded-lg">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border">
                                    <TableHead className="font-semibold">Name</TableHead>
                                    <TableHead className="font-semibold hidden sm:table-cell">Ticker</TableHead>
                                    <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                                    <TableHead className="font-semibold hidden md:table-cell">Broker</TableHead>
                                    <TableHead className="font-semibold hidden lg:table-cell text-right">Units</TableHead>
                                    <TableHead className="font-semibold hidden lg:table-cell text-right">Cost Basis</TableHead>
                                    <TableHead className="font-semibold text-right">Gain %</TableHead>
                                    <TableHead className="font-semibold text-right">Current Value</TableHead>
                                    <TableHead className="w-[70px]">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPortfolios.map((portfolio) => {
                                    return (
                                        <TableRow key={portfolio.id} className="hover:bg-transparent border">
                                            <TableCell className="font-medium whitespace-pre-wrap break-words">
                                                <Link
                                                    href={`/investment-transactions?portfolioId=${portfolio.id}`}
                                                    className="text-foreground hover:text-primary hover:underline"
                                                >
                                                    {portfolio.name}
                                                </Link>
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
                                            <TableCell className="text-right tabular-nums">
                                                {(() => {
                                                    const pct = computeGainPct(portfolio.currentValue, portfolio.totalCostBasis)
                                                    if (pct === null) return <span className="text-muted-foreground">—</span>
                                                    const color = pct > 0
                                                        ? "text-emerald-500"
                                                        : pct < 0
                                                            ? "text-red-500"
                                                            : "text-muted-foreground"
                                                    return (
                                                        <span className={`inline-flex items-center gap-1 font-medium ${color}`}>
                                                            {pct > 0 ? (
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                            ) : pct < 0 ? (
                                                                <ArrowDownRight className="h-3.5 w-3.5" />
                                                            ) : null}
                                                            {formatGainPct(pct)}
                                                        </span>
                                                    )
                                                })()}
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
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/investment-transactions?portfolioId=${portfolio.id}`}
                                                                className="cursor-pointer"
                                                            >
                                                                <ScrollText className="mr-2 h-4 w-4" />
                                                                Transactions
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant={'default'}
                                                            className={'active:bg-primary/40'}
                                                            onClick={() => handleEdit(portfolio)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => handleDelete(portfolio)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
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
                </CardContent>
            </Card>
        </div>
    )
}