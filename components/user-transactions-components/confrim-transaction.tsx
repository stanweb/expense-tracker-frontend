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
import { ParsedTransaction } from "@/Interfaces/Interfaces";

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

    useEffect(() => {
        if (isOpen) {
            axioClient.get("/users/1/categories").then((res) => setCategories(res.data));
            // Reset categories on new modal open
            setTransactionCategories({});
        }
    }, [isOpen]);

    const handleCategoryChange = (index: number, categoryId: string) => {
        setTransactionCategories(prev => ({ ...prev, [index]: categoryId }));
    };

    const allTransactionsCategorized = parsed.length > 0 && parsed.every((_, index) => transactionCategories[index]);

    const handleSubmit = async () => {
        if (!allTransactionsCategorized) return;

        setIsLoading(true);
        try {
            const transactionsToSave = parsed.map((p, index) => ({
                ...p,
                categoryId: Number(transactionCategories[index])
            }));

            await axioClient.post("/users/1/transactions", transactionsToSave);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {isLoading && <LoadingOverlay message="AI is processing transactions..." />}
            <DialogContent className="sm:max-w-[800px]">
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
                                        <TableCell>{p.recipient || "N/A"}</TableCell>
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
