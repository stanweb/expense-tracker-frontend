'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSelector } from "react-redux"
import { Inbox, MoreHorizontal, Pencil, Plus, Target, Trash2 } from "lucide-react"

import {
    Goal,
    GoalPayload,
    GoalSummary,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/ToastProvider"
import {
    createGoal,
    deleteGoal,
    getGoalSummary,
    getGoals,
    updateGoal,
} from "@/components/api-calls/goals"
import { GoalForm } from "@/components/goals/goal-form"
import { ConfirmDeleteGoalModal } from "@/components/goals/confirm-delete-goal-modal"
import { GoalStatusBadge } from "@/components/goals/goal-status-badge"
import { GoalSummaryCards } from "@/components/goals/goal-summary-cards"
import { GoalsListSkeleton } from "@/components/goals/goals-list-skeleton"
import { formatDate, formatMoney, formatPercent } from "@/components/goals/format"
import getPageNumbers from "@/utils/getPageNumbers"

const PAGE_SIZE = 20

export function GoalsList() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const userId = useSelector((s: RootState) => s.user.userId)
    const { showToast } = useToast()

    const [goals, setGoals] = useState<Goal[]>([])
    const [summary, setSummary] = useState<GoalSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null)
    const [deleting, setDeleting] = useState(false)

    const page = useMemo(() => {
        const v = Number(searchParams.get("page"))
        return Number.isFinite(v) && v >= 1 ? Math.floor(v) : 1
    }, [searchParams])

    const updateQuery = useCallback(
        (patch: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString())
            if (!("page" in patch)) {
                params.delete("page")
            }
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
        [searchParams, router, pathname]
    )

    const setPage = useCallback(
        (next: number) => {
            updateQuery({ page: next <= 1 ? undefined : String(next) })
        },
        [updateQuery]
    )

    useEffect(() => {
        if (!userId) return
        let cancelled = false
        setLoading(true)
        setError(null)
        Promise.all([
            getGoals(userId, { page, size: PAGE_SIZE }),
            getGoalSummary(userId).catch(() => null),
        ])
            .then(([paged, summaryResult]) => {
                if (cancelled) return
                setGoals(paged.content)
                setTotalPages(paged.totalPages)
                setTotalElements(paged.totalElements)
                if (summaryResult) setSummary(summaryResult)
            })
            .catch((err: any) => {
                if (cancelled) return
                const message = err?.message || "Failed to load goals"
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
    }, [userId, page, refreshKey, showToast])

    const handleAdd = () => {
        setEditingGoal(null)
        setFormOpen(true)
    }

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal)
        setFormOpen(true)
    }

    const handleDelete = (goal: Goal) => {
        setDeleteTarget(goal)
    }

    const handleSubmit = async (payload: GoalPayload, existing?: Goal | null) => {
        if (!userId) return
        try {
            if (existing && existing.id) {
                await updateGoal(userId, existing.id, payload)
                showToast({
                    title: "Success!",
                    description: "Your goal has been updated.",
                    variant: "success",
                    duration: 5000,
                })
            } else {
                await createGoal(userId, payload)
                showToast({
                    title: "Success!",
                    description: "Your goal has been saved.",
                    variant: "success",
                    duration: 5000,
                })
            }
            setFormOpen(false)
            setEditingGoal(null)
            // Creating pushes us back to page 1 so the new row is visible.
            if (!existing) updateQuery({ page: undefined })
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message ||
                    "An error occurred while saving your goal.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const confirmDelete = async () => {
        if (!userId || !deleteTarget) return
        setDeleting(true)
        try {
            await deleteGoal(userId, deleteTarget.id)
            showToast({
                title: "Success!",
                description: `${deleteTarget.name} has been deleted.`,
                variant: "success",
                duration: 5000,
            })
            setDeleteTarget(null)
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message ||
                    "An error occurred while deleting.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-8 max-w-7xl">
            <Card className="px-4 sm:px-8">
                <CardHeader className="space-y-1 pb-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                Goals
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base mt-1.5">
                                Track your savings targets and contributions
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleAdd}
                            size="default"
                            className="gap-2 mt-4 sm:mt-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sm:inline">Add Goal</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {summary && <GoalSummaryCards summary={summary} />}

                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <p>
                            {loading
                                ? "Loading…"
                                : `${totalElements} ${
                                      totalElements === 1 ? "goal" : "goals"
                                  }`}
                        </p>
                        {totalPages > 1 && (
                            <p>
                                Page {page} of {totalPages}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <GoalsListSkeleton count={6} />
                    ) : error ? (
                        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                            <Inbox className="h-10 w-10 opacity-50" />
                            <p className="text-sm">No goals yet.</p>
                            <p className="text-xs">
                                Click "Add Goal" to start tracking your first
                                savings target.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden text-right sm:table-cell">
                                            Target
                                        </TableHead>
                                        <TableHead className="hidden text-right sm:table-cell">
                                            Saved
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Progress
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Days left
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[60px]">
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {goals.map((goal) => {
                                        const progressPct = Math.min(
                                            100,
                                            Math.max(0, (goal.progress ?? 0) * 100)
                                        )
                                        return (
                                            <TableRow key={goal.id}>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <Link
                                                            href={`/goals/${goal.id}`}
                                                            className="font-medium text-foreground hover:text-primary hover:underline truncate max-w-[260px]"
                                                        >
                                                            {goal.name}
                                                        </Link>
                                                        {goal.description && (
                                                            <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                                                                {goal.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                    {formatMoney(goal.targetAmount)}
                                                </TableCell>
                                                <TableCell className="hidden text-right tabular-nums sm:table-cell">
                                                    {formatMoney(goal.savedAmount)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2 min-w-[160px]">
                                                        <Progress
                                                            value={progressPct}
                                                            className="h-2 flex-1"
                                                        />
                                                        <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
                                                            {formatPercent(goal.progress)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell tabular-nums text-muted-foreground">
                                                    {goal.daysLeft >= 0
                                                        ? `${goal.daysLeft} days`
                                                        : `${Math.abs(goal.daysLeft)} days overdue`}
                                                </TableCell>
                                                <TableCell>
                                                    <GoalStatusBadge
                                                        status={goal.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <span className="sr-only">
                                                                    Open menu
                                                                </span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/goals/${goal.id}`}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Target className="mr-2 h-4 w-4" />
                                                                    View details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(goal)
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    handleDelete(goal)
                                                                }
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
                        </div>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="pt-2">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (page > 1) setPage(page - 1)
                                            }}
                                            aria-disabled={page <= 1}
                                            className={
                                                page <= 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                    {getPageNumbers(page, totalPages).map((p, idx) =>
                                        p === "…" ? (
                                            <PaginationItem
                                                key={`ellipsis-${idx}`}
                                            >
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={p === page}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setPage(p)
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                if (page < totalPages)
                                                    setPage(page + 1)
                                            }}
                                            aria-disabled={page >= totalPages}
                                            className={
                                                page >= totalPages
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            <GoalForm
                isOpen={formOpen}
                onClose={() => {
                    setFormOpen(false)
                    setEditingGoal(null)
                }}
                onSubmit={handleSubmit}
                goal={editingGoal}
            />

            <ConfirmDeleteGoalModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                goalName={deleteTarget?.name ?? ""}
                loading={deleting}
                onConfirm={() => void confirmDelete()}
            />
        </div>
    )
}
