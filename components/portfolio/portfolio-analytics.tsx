'use client'

import { useMemo } from "react"
import {
    ArrowDownRight,
    ArrowUpRight,
    Layers,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Portfolio } from "@/Interfaces/Interfaces"

interface PortfolioAnalyticsProps {
    portfolios: Portfolio[]
}

const formatMoney = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "0.00"
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) return null
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}%`
}

const toNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return 0
    const n = Number(value)
    return Number.isNaN(n) ? 0 : n
}

interface Analytics {
    totalValue: number
    totalCost: number
    totalGain: number
    totalGainPct: number | null
    bestPerformer: { name: string; gain: number; gainPct: number } | null
    worstPerformer: { name: string; gain: number; gainPct: number } | null
    allocation: { typeName: string; value: number; sharePct: number }[]
}

function computeAnalytics(portfolios: Portfolio[]): Analytics {
    let totalValue = 0
    let totalCost = 0
    const ranked: { name: string; gain: number; gainPct: number }[] = []

    for (const p of portfolios) {
        const value = toNumber(p.currentValue)
        const cost = toNumber(p.totalCostBasis)
        const gain = value - cost
        const gainPct = cost > 0 ? (gain / cost) * 100 : null
        totalValue += value
        totalCost += cost
        if (gainPct !== null) {
            ranked.push({ name: p.name, gain, gainPct })
        }
    }

    let best: Analytics["bestPerformer"] = null
    let worst: Analytics["worstPerformer"] = null
    if (ranked.length > 1) {
        for (const entry of ranked) {
            if (!best || entry.gainPct > best.gainPct) best = entry
            if (!worst || entry.gainPct < worst.gainPct) worst = entry
        }
        if (best && worst && best.name === worst.name) {
            best = null
            worst = null
        }
    }

    const allocationMap = new Map<string, number>()
    for (const p of portfolios) {
        const key = p.typeName ?? "Unclassified"
        allocationMap.set(key, (allocationMap.get(key) ?? 0) + toNumber(p.currentValue))
    }
    const allocation = Array.from(allocationMap.entries())
        .map(([typeName, value]) => ({
            typeName,
            value,
            sharePct: totalValue > 0 ? (value / totalValue) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)

    return {
        totalValue,
        totalCost,
        totalGain: totalValue - totalCost,
        totalGainPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : null,
        bestPerformer: best,
        worstPerformer: worst,
        allocation,
    }
}

interface KpiCardProps {
    label: string
    icon: React.ReactNode
    primary: React.ReactNode
    secondary?: React.ReactNode
    valueClassName?: string
}

function KpiCard({ label, icon, primary, secondary, valueClassName }: KpiCardProps) {
    return (
        <Card className="bg-card text-card-foreground">
            <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
                    {icon}
                </div>
                <div className={`text-2xl font-semibold tabular-nums ${valueClassName ?? ""}`}>
                    {primary}
                </div>
                {secondary && (
                    <div className="text-xs text-muted-foreground tabular-nums">{secondary}</div>
                )}
            </CardContent>
        </Card>
    )
}

export function PortfolioAnalytics({ portfolios }: PortfolioAnalyticsProps) {
    const analytics = useMemo(() => computeAnalytics(portfolios), [portfolios])

    if (portfolios.length === 0) {
        return (
            <div className="grid grid-cols-1 gap-4">
                <Card>
                    <CardContent className="p-5 text-sm text-muted-foreground">
                        No portfolio data yet — add a portfolio to see your analytics.
                    </CardContent>
                </Card>
            </div>
        )
    }

    const gainIsPositive = analytics.totalGain > 0
    const gainIsNegative = analytics.totalGain < 0
    const gainColor = gainIsPositive
        ? "text-emerald-500"
        : gainIsNegative
            ? "text-red-500"
            : "text-muted-foreground"

    const GainIcon = gainIsPositive ? ArrowUpRight : gainIsNegative ? ArrowDownRight : null

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Total portfolio value"
                    icon={<Wallet className="h-4 w-4" />}
                    primary={formatMoney(analytics.totalValue)}
                    secondary={`${portfolios.length} ${
                        portfolios.length === 1 ? "portfolio" : "portfolios"
                    } · cost basis ${formatMoney(analytics.totalCost)}`}
                />
                <KpiCard
                    label={gainIsPositive ? "Total gain" : gainIsNegative ? "Total loss" : "Total gain / loss"}
                    icon={
                        gainIsPositive ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : gainIsNegative ? (
                            <TrendingDown className="h-4 w-4" />
                        ) : (
                            <Wallet className="h-4 w-4" />
                        )
                    }
                    primary={
                        <span className="inline-flex items-center gap-1">
                            {GainIcon && <GainIcon className="h-5 w-5" />}
                            {formatMoney(Math.abs(analytics.totalGain))}
                        </span>
                    }
                    valueClassName={gainColor}
                    secondary={
                        formatPercent(analytics.totalGainPct) ?? "No cost basis recorded"
                    }
                />
                <KpiCard
                    label="Best performer"
                    icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                    primary={
                        analytics.bestPerformer ? (
                            <span className="text-emerald-500">
                                {formatPercent(analytics.bestPerformer.gainPct)}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )
                    }
                    secondary={
                        analytics.bestPerformer
                            ? `${analytics.bestPerformer.name} · ${formatMoney(
                                  analytics.bestPerformer.gain,
                              )}`
                            : "Not enough cost basis data"
                    }
                />
                <KpiCard
                    label="Worst performer"
                    icon={<TrendingDown className="h-4 w-4 text-red-500" />}
                    primary={
                        analytics.worstPerformer ? (
                            <span className="text-red-500">
                                {formatPercent(analytics.worstPerformer.gainPct)}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )
                    }
                    secondary={
                        analytics.worstPerformer
                            ? `${analytics.worstPerformer.name} · ${formatMoney(
                                  analytics.worstPerformer.gain,
                              )}`
                            : "Not enough cost basis data"
                    }
                />
            </div>

            <Card>
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Layers className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                            Allocation by type
                        </span>
                    </div>
                    {analytics.allocation.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No allocations to show.</p>
                    ) : (
                        <ul className="space-y-2.5">
                            {analytics.allocation.map((row) => (
                                <li key={row.typeName} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">
                                            {row.typeName}
                                        </span>
                                        <span className="tabular-nums text-muted-foreground">
                                            {formatMoney(row.value)} · {row.sharePct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${Math.min(100, Math.max(0, row.sharePct))}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}