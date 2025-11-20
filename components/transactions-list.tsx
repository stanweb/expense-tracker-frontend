'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import * as Icons from 'lucide-react'
import { ElementType, useEffect, useState } from "react";
import axioClient from "@/utils/axioClient"
import { Button } from "@/components/ui/button";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import ConfirmTransactionModal from "@/components/confrim-transaction";
import {ParsedTransaction, RootState} from "@/Interfaces/Interfaces";
import {useSelector} from "react-redux";

// -----------------------------
// Types
// -----------------------------

interface ApiTransaction {
    id: number
    amount: number
    date: string
    type: string
    categoryId: number
    recipient: string
    categoryName?: string
    categoryIcon: string
}

interface UiTransaction {
    id: number
    name: string
    category?: string
    amount: number
    date: string // "Today", "Yesterday", etc.
    recipient?: string
    categoryName?: string
    icon: ElementType
}

// -----------------------------
// Helper Functions
// -----------------------------

const getIcon = (categoryIcon: string) => {
    if(categoryIcon != null && categoryIcon.length > 1) return Icons[categoryIcon as keyof typeof Icons]
    return Icons.CreditCard
}

const formatDaysAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
}

// -----------------------------
// Component
// -----------------------------

export function TransactionsList() {
    const [transactions, setTransactions] = useState<UiTransaction[]>([])
    const [showAddRawTransactionModal, setShowAddRawTransactionModal] = useState(false)
    const [showConfirmTransactionModal, setShowConfirmTransactionModal] = useState(false)
    const [parsedTransactionData, setParsedTransactionData] = useState<ParsedTransaction>()

    // ✅ Get fromDate and toDate from Redux
    const { fromDate, toDate } = useSelector((state:RootState) => state.dateRange)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axioClient.get<ApiTransaction[]>(
                    "users/1/transactions",
                    {
                        params: {
                            from: fromDate ?? "",
                            to: toDate ?? "",
                        },
                    }
                )
                const data = response.data

                const formatted: UiTransaction[] = data.map((t) => ({
                    id: t.id,
                    name: t.recipient,
                    category: t.categoryName,
                    amount: t.amount,
                    icon: getIcon(t.categoryIcon) as ElementType,
                    date: formatDaysAgo(t.date),
                }))

                setTransactions(formatted)
            } catch (error) {
                console.error("Error fetching transactions:", error)
            }
        }

        void fetchTransactions()
    }, [fromDate, toDate]) // ⬅️ refetch whenever date range changes

    const parseTransaction = (message: string) => {
        axioClient
            .post("/users/raw/transaction", { message })
            .then((response) => {
                setParsedTransactionData(response.data)
                setShowConfirmTransactionModal(true)
            })
            .catch((error) => {
                console.error("Error parsing transaction:", error)
            })
    }

    return (
        <Card className="bg-card">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest spending activities</CardDescription>
                </div>

                <Button
                    className="ml-auto"
                    variant="default"
                    onClick={() => setShowAddRawTransactionModal(true)}
                >
                    Add Transaction
                </Button>
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
                        onSuccess={() => setShowConfirmTransactionModal(false)}
                    />
                )}

                <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-3">
                        {transactions.map((transaction) => {
                            const Icon = transaction.icon;
                            return (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{transaction.name}</p>
                                            <p className="text-xs text-foreground/60">{transaction.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-foreground">
                                                KES {transaction.amount}
                                            </p>
                                            <Badge variant="secondary" className="text-xs mt-1">
                                                {transaction.category}
                                            </Badge>
                                        </div>
                                        <Icons.ChevronRight className="h-4 w-4 text-foreground/30" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
