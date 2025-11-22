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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Category {
    id: number;
    name: string;
    description: string;
}

interface ConfirmTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    parsed: any;
    onSuccess: () => void;
}

export default function ConfirmTransactionModal({ isOpen, onClose, parsed, onSuccess }: ConfirmTransactionModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            axioClient.get("/users/1/categories").then((res) => setCategories(res.data));
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await axioClient.post("/users/1/transactions", {
                amount: parsed.amount,
                recipient: parsed.recipient || "Transaction",
                date: parsed.date,
                categoryId: Number(selectedCategory),
                transactionCost: parsed.transactionCost,
                transactionId: parsed.transactionId,
                type: parsed.type,
                rawMessage: parsed.rawMessage,
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const transactionData = [
        { label: "Amount", value: parsed.amount },
        { label: "Transaction Cost", value: parsed.transactionCost },
        { label: "Date", value: parsed.date },
        { label: "Recipient", value: parsed.recipient || "N/A" },
        { label: "Type", value: parsed.type },
        { label: "Transaction ID", value: parsed.transactionId || "N/A" },
        { label: "Raw Message", value: parsed.rawMessage || "N/A" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Confirm Transaction</DialogTitle>
                    <DialogDescription>Review the extracted details and confirm the transaction.</DialogDescription>
                </DialogHeader>
                <div className="mt-2">
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableBody>
                                {transactionData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium w-1/3 whitespace-pre-wrap break-words">{item.label}</TableCell>
                                        <TableCell className="whitespace-pre-wrap break-words">{item.value}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell className="font-medium w-1/3">Category</TableCell>
                                    <TableCell>
                                        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a category" />
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
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!selectedCategory || isLoading}>
                        {isLoading ? "Saving..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
