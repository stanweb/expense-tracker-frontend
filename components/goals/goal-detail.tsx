'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import {
    ArrowLeft,
    Inbox,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Goal,
    GoalContribution,
    GoalContributionPayload,
    GoalPayload,
    RootState,
} from "@/Interfaces/Interfaces"
import { useToast } from "@/components/ui/ToastProvider"
import {
    createGoalContribution,
    deleteGoal,
    deleteGoalContribution,
    getGoal,
    getGoalContributions,
    updateGoal,
} from "@/components/api-calls/goals"
import { GoalForm } from "@/components/goals/goal-form"
import { GoalStatusBadge } from "@/components/goals/goal-status-badge"
import { ContributionFormModal } from "@/components/goals/contribution-form-modal"
import { ContributionsListSkeleton } from "@/components/goals/contributions-list-skeleton"
import {
    formatDate,
    formatDateTime,
    formatMoney,
    formatPercent,
} from "@/components/goals/format"
import getPageNumbers from "@/utils/getPageNumbers"

const PAGE_SIZE = 20

interface GoalDetailProps {
    goalId: number
}

export function GoalDetail({ goalId }: GoalDetailProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const userId = useSelector((s: RootState) => s.user.userId)
    const { showToast } = useToast()

    const [goal, setGoal] = useState<Goal | null>(null)
    const [contributions, setContributions] = useState<GoalContribution[]>([])
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [contributionOpen, setContributionOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<GoalContribution | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deletingGoal, setDeletingGoal] = useState(false)

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
                if (value === undefined || value === "") {
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
            getGoal(userId, goalId),
            getGoalContributions(userId, goalId, { page, size: PAGE_SIZE }),
        ])
            .then(([goalData, paged]) => {
                if (cancelled) return
                setGoal(goalData)
                setContributions(paged.content)
                setTotalPages(paged.totalPages)
                setTotalElements(paged.totalElements)
            })
            .catch((err: any) => {
                if (cancelled) return
                const message = err?.message || "Failed to load goal"
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
    }, [userId, goalId, page, refreshKey, showToast])

    const handleSubmitGoal = async (payload: GoalPayload) => {
        if (!userId || !goal) return
        try {
            await updateGoal(userId, goal.id, payload)
            showToast({
                title: "Success!",
                description: "Your goal has been updated.",
                variant: "success",
                duration: 5000,
            })
            setFormOpen(false)
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

    const handleAddContribution = async (payload: GoalContributionPayload) => {
        if (!userId || !goal) return
        try {
            const updated = await createGoalContribution(userId, goal.id, payload)
            showToast({
                title: "Success!",
                description: "Contribution recorded.",
                variant: "success",
                duration: 5000,
            })
            setContributionOpen(false)
            // Server returns the updated goal; reflect it immediately and refresh the list.
            setGoal(updated)
            updateQuery({ page: undefined })
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message ||
                    "An error occurred while saving the contribution.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const confirmReverseContribution = async () => {
        if (!userId || !goal || !deleteTarget) return
        setDeleting(true)
        try {
            const updated = await deleteGoalContribution(
                userId,
                goal.id,
                deleteTarget.id
            )
            showToast({
                title: "Success!",
                description: "Contribution reversed.",
                variant: "success",
                duration: 5000,
            })
            setDeleteTarget(null)
            setGoal(updated)
            // After removal, the current page may be out of range — reset to page 1
            // if it would be, otherwise keep the user where they were.
            const nextTotal = Math.max(0, totalElements - 1)
            const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE))
            if (page > nextTotalPages) updateQuery({ page: undefined })
            setRefreshKey((k) => k + 1)
        } catch (err: any) {
            showToast({
                title: "Error!",
                description:
                    err?.response?.data?.message ||
                    "An error occurred while reversing the contribution.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setDeleting(false)
        }
    }

    const confirmDeleteGoal = async () => {
        if (!userId || !goal) return
        setDeletingGoal(true)
        try {
            await deleteGoal(userId, goal.id)
            showToast({
                title: "Success!",
                description: `${goal.name} has been deleted.`,
                variant: "success",
                duration: 5000,
            })
            router.push("/goals")
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
            setDeletingGoal(false)
        }
    }

    if (loading && !goal) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                    Loading goal…
                </CardContent>
            </Card>
        )
    }

    if (error && !goal) {
        return (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
            </div>
        )
    }

    if (!goal) {
        return (
            <div className="rounded-md border border-border/40 bg-card p-6 text-sm text-muted-foreground">
                Goal not found.{" "}
                <Link
                    href="/goals"
                    className="text-primary hover:underline"
                >
                    Back to goals
                </Link>
            </div>
        )
    }

    const progressPct = Math.min(100, Math.max(0, (goal.progress ?? 0) * 100))
    const daysLabel =
        goal.daysLeft >= 0
            ? `${goal.daysLeft} days left`
            : `${Math.abs(goal.daysLeft)} days overdue`

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/goals">
                        <ArrowLeft className="h-4 w-4" />
                        Back to goals
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => setFormOpen(true)}
                            className="cursor-pointer"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit goal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                                if (confirm(`Delete "${goal.name}"? This will also remove all of its contributions.`)) {
                                    void confirmDeleteGoal()
                                }
                            }}
                            className="cursor-pointer"
                            disabled={deletingGoal}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete goal
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                            <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                {goal.name}
                            </CardTitle>
                            {goal.description && (
                                <CardDescription className="text-sm sm:text-base">
                                    {goal.description}
                                </CardDescription>
                            )}
                        </div>
                        <GoalStatusBadge status={goal.status} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium tabular-nums">
                                {formatPercent(goal.progress)}
                            </span>
                        </div>
                        <Progress value={progressPct} className="h-2" />
                    </div>
                    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3 text-sm">
                        <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">
                                Target
                            </dt>
                            <dd className="font-semibold tabular-nums">
                                {formatMoney(goal.targetAmount)}
                            </dd>
                        </div>
                        <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">
                                Saved
                            </dt>
                            <dd className="font-semibold tabular-nums text-emerald-600">
                                {formatMoney(goal.savedAmount)}
                            </dd>
                        </div>
                        <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">
                                Remaining
                            </dt>
                            <dd className="font-semibold tabular-nums">
                                {formatMoney(goal.remaining)}
                            </dd>
                        </div>
                        <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">
                                Start date
                            </dt>
                            <dd className="font-medium">
                                {formatDate(goal.startDate)}
                            </dd>
                        </div>
                        <div className="space-y-1">
                            <dt className="text-xs text-muted-foreground">
                                Target date
                            </dt>
                            <dd className="font-medium">
                                {formatDate(goal.targetDate)}{" "}
                                <span className="text-xs text-muted-foreground">
                                    ({daysLabel})
                                </span>
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">
                                Contributions
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Every deposit against this goal.
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setContributionOpen(true)}
                            className="gap-2"
                            size="default"
                        >
                            <Plus className="h-4 w-4" />
                            Add Contribution
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <p>
                            {loading
                                ? "Loading…"
                                : `${totalElements} ${
                                      totalElements === 1
                                          ? "contribution"
                                          : "contributions"
                                  }`}
                        </p>
                        {totalPages > 1 && (
                            <p>
                                Page {page} of {totalPages}
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <ContributionsListSkeleton count={5} />
                    ) : contributions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                            <Inbox className="h-10 w-10 opacity-50" />
                            <p className="text-sm">No contributions yet.</p>
                            <p className="text-xs">
                                Click "Add Contribution" to record your first
                                deposit.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">
                                            Amount
                                        </TableHead>
                                        <TableHead className="hidden sm:table-cell">
                                            Transaction
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            Note
                                        </TableHead>
                                        <TableHead className="w-[60px]">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contributions.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="whitespace-nowrap text-xs">
                                                {formatDateTime(c.contributedAt)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums font-medium">
                                                {formatMoney(c.amount)}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {c.transactionId ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono"
                                                    >
                                                        {c.transactionId}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[280px]">
                                                {c.note || "—"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteTarget(c)
                                                    }
                                                    aria-label="Reverse contribution"
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
                                    {getPageNumbers(page, totalPages).map(
                                        (p, idx) =>
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
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmitGoal}
                goal={goal}
            />

            <ContributionFormModal
                isOpen={contributionOpen}
                onClose={() => setContributionOpen(false)}
                onSubmit={handleAddContribution}
            />

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reverse contribution?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the contribution
                            {deleteTarget
                                ? ` of ${formatMoney(deleteTarget.amount)}`
                                : ""}{" "}
                            from this goal. The goal's saved amount and progress
                            will be recalculated. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                void confirmReverseContribution()
                            }}
                            disabled={deleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting ? "Reversing…" : "Reverse"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
