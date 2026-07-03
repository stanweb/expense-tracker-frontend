'use client'

import { useEffect, useState } from "react"
import { Search, Loader2, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ApiTransaction, GoalContributionPayload, RootState } from "@/Interfaces/Interfaces"
import { useSelector } from "react-redux"
import { useToast } from "@/components/ui/ToastProvider"
import axiosClient from "@/utils/apiClient"
import { formatDate, formatMoney } from "@/components/goals/format"

interface ContributionFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: GoalContributionPayload) => void
}

const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fromLocalInput = (value: string): string => {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toISOString()
}

export function ContributionFormModal({
    isOpen,
    onClose,
    onSubmit,
}: ContributionFormModalProps) {
    const userId = useSelector((s: RootState) => s.user.userId)
    const { showToast } = useToast()

    const [transactionId, setTransactionId] = useState("")
    const [lookupLoading, setLookupLoading] = useState(false)
    const [linkedTransaction, setLinkedTransaction] = useState<ApiTransaction | null>(null)
    const [lookupError, setLookupError] = useState<string | null>(null)

    const [amount, setAmount] = useState("")
    const [contributedAt, setContributedAt] = useState(toLocalInput(new Date()))
    const [note, setNote] = useState("")
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (isOpen) {
            setTransactionId("")
            setLinkedTransaction(null)
            setLookupError(null)
            setAmount("")
            setContributedAt(toLocalInput(new Date()))
            setNote("")
            setErrors({})
        }
    }, [isOpen])

    const handleFindTransaction = async () => {
        if (!userId) return
        const trimmed = transactionId.trim()
        if (!trimmed) {
            setLookupError("Enter a transaction ID first.")
            return
        }
        setLookupLoading(true)
        setLookupError(null)
        try {
            const response = await axiosClient.get<ApiTransaction>(
                `users/${userId}/transactions/${encodeURIComponent(trimmed)}`
            )
            const tx = response.data
            setLinkedTransaction(tx)
            // Prefill amount and contributedAt from the linked transaction;
            // the user can still override either before submitting.
            if (tx.amount !== undefined && tx.amount !== null) {
                setAmount(String(tx.amount))
            }
            if (tx.date) {
                const d = new Date(tx.date)
                if (!Number.isNaN(d.getTime())) {
                    setContributedAt(toLocalInput(d))
                }
            }
            showToast({
                title: "Transaction found",
                description: "Amount and date prefilled from the transaction.",
                variant: "success",
                duration: 3000,
            })
        } catch (err: any) {
            setLinkedTransaction(null)
            const message =
                err?.response?.data?.message ||
                "Could not find that transaction."
            setLookupError(message)
            showToast({
                title: "Lookup failed",
                description: message,
                variant: "error",
                duration: 4000,
            })
        } finally {
            setLookupLoading(false)
        }
    }

    const clearLinkedTransaction = () => {
        setLinkedTransaction(null)
        setLookupError(null)
        // Keep transactionId so the user can re-find without re-typing.
    }

    const validate = () => {
        const newErrors: { [key: string]: string } = {}
        const amountNum = Number(amount)
        if (amount === "" || Number.isNaN(amountNum) || amountNum <= 0) {
            newErrors.amount = "Amount must be greater than 0."
        }
        if (!contributedAt) {
            newErrors.contributedAt = "Contribution date is required."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit({
            amount: Number(amount),
            contributedAt: fromLocalInput(contributedAt),
            transactionId: linkedTransaction
                ? linkedTransaction.transactionId
                    ? String(linkedTransaction.transactionId)
                    : transactionId.trim() || null
                : transactionId.trim() || null,
            note: note.trim() || null,
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>Add Contribution</DialogTitle>
                    <DialogDescription>
                        Record a contribution to this goal. Optionally link it to
                        an existing transaction to autofill the amount and date.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="tx-id">Transaction ID (optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tx-id"
                                value={transactionId}
                                onChange={(e) =>
                                    setTransactionId(e.target.value)
                                }
                                placeholder="e.g. UFRCF95ED4"
                                className="bg-input text-foreground border-input"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void handleFindTransaction()}
                                disabled={lookupLoading}
                                className="gap-1 shrink-0"
                            >
                                {lookupLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                Find
                            </Button>
                        </div>
                        {lookupError && (
                            <p className="text-sm text-destructive">
                                {lookupError}
                            </p>
                        )}
                    </div>

                    {linkedTransaction && (
                        <Card className="bg-muted/30">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                        <dt className="text-muted-foreground">
                                            Recipient
                                        </dt>
                                        <dd className="font-medium truncate">
                                            {linkedTransaction.recipient || "—"}
                                        </dd>
                                        <dt className="text-muted-foreground">
                                            Date
                                        </dt>
                                        <dd className="tabular-nums">
                                            {formatDate(linkedTransaction.date)}
                                        </dd>
                                        <dt className="text-muted-foreground">
                                            Amount
                                        </dt>
                                        <dd className="tabular-nums font-medium">
                                            {formatMoney(linkedTransaction.amount)}
                                        </dd>
                                    </dl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearLinkedTransaction}
                                        aria-label="Clear linked transaction"
                                        className="h-7 w-7"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="contrib-amount">Amount</Label>
                        <Input
                            id="contrib-amount"
                            type="number"
                            step="any"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="5000.00"
                            className="bg-input text-foreground border-input"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contrib-date">Contributed at</Label>
                        <Input
                            id="contrib-date"
                            type="datetime-local"
                            value={contributedAt}
                            onChange={(e) => setContributedAt(e.target.value)}
                            className="bg-input text-foreground border-input"
                        />
                        {errors.contributedAt && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.contributedAt}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contrib-note">Note (optional)</Label>
                        <Textarea
                            id="contrib-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Initial deposit"
                            className="bg-input text-foreground border-input"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
