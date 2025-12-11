"use client"

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/select";
import axioClient from "@/utils/axioClient";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ParsedTransaction, RootState } from "@/Interfaces/Interfaces";
import {useDispatch, useSelector} from "react-redux";
import {setTransactionTrigger} from "@/store/dateSlice";

interface Category {
    id: number;
    name: string;
    description: string;
}

interface ConfirmTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    parsed: ParsedTransaction[];
    onSuccess: () => void;
}

export default function ConfirmTransactionModal({ isOpen, onClose, parsed, onSuccess }: ConfirmTransactionModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactionCategories, setTransactionCategories] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const userId = useSelector((state: RootState) => state.user.userId);
    const dispatch = useDispatch()

    useEffect(() => {
        if (isOpen && userId) {
            axioClient.get(`/users/${userId}/categories`).then((res) => {
                setCategories(res.data);
                const uncategorized = res.data.find((c: Category) => c.name.toLowerCase() === "Uncategorized".toLowerCase());
                if (uncategorized) {
                    const initialCategories = parsed.reduce((acc, _, index) => {
                        acc[index] = String(uncategorized.id);
                        return acc;
                    }, {} as { [key: number]: string });
                    setTransactionCategories(initialCategories);
                }
            });
        }
    }, [isOpen, userId, parsed]);

    const handleCategoryChange = (index: number, categoryId: string) => {
        setTransactionCategories(prev => ({ ...prev, [index]: categoryId }));
    };

    const allTransactionsCategorized = parsed.length > 0 && parsed.every((_, index) => transactionCategories[index]);

    const handleSubmit = async () => {
        if (!allTransactionsCategorized || !userId) return;

        setIsLoading(true);
        try {
            const transactionsToSave = parsed.map((p, index) => ({
                ...p,
                categoryId: Number(transactionCategories[index])
            }));

            await axioClient.post(`/users/${userId}/transactions`, transactionsToSave);
            onSuccess();
            onClose();
            dispatch(setTransactionTrigger(Date.now().toString()))
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {isLoading && <LoadingOverlay message="AI is processing transactions..." />}
            <DialogContent className="sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Confirm Transactions</DialogTitle>
                    <DialogDescription>Review the extracted transactions and assign a category to each.</DialogDescription>
                </DialogHeader>
                <div className="mt-2">
                    <ScrollArea className="h-[400px] pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsed.map((p, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{p.recipient?.slice(0,40) || "N/A"}</TableCell>
                                        <TableCell>{p.amount}</TableCell>
                                        <TableCell>{new Date(p.date).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Select onValueChange={(value) => handleCategoryChange(index, value)} value={transactionCategories[index]}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!allTransactionsCategorized || isLoading}>
                        {isLoading ? "Saving..." : "Confirm All"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
