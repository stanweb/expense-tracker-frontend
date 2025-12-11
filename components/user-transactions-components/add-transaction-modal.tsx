"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AddTransaction, Category, RootState } from "@/Interfaces/Interfaces";
import { getCategories } from "@/components/api-calls/categories";
import { useSelector } from "react-redux";

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (transaction: AddTransaction) => void;
    isLoading?: boolean;
}

type Errors = Partial<Record<keyof AddTransaction, string>>;

const emptyTransaction = {
    transactionId: "",
    amount: "",
    transactionCost: "",
    date: "",
    recipient: "",
    type: "",
    rawMessage: "",
    categoryId: 0,
} as unknown as AddTransaction;

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSubmit,
                                                                            isLoading = false,
                                                                        }) => {
    const userId = useSelector((state: RootState) => state.user.userId);

    const [transaction, setTransaction] = useState<AddTransaction>(emptyTransaction);
    const [errors, setErrors] = useState<Errors>({});
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (isOpen && userId) {
            (async () => {
                const fetched = await getCategories(userId);
                setCategories(fetched);
            })();
        }
    }, [isOpen, userId]);

    const validate = (): Errors => {
        const err: Errors = {};

        if (!transaction.transactionId) err.transactionId = "Transaction ID is required";
        if (!transaction.amount || Number(transaction.amount) <= 0)
            err.amount = "Amount must be greater than 0";
        if (!transaction.date) err.date = "Date is required";
        if (!transaction.recipient) err.recipient = "Recipient is required";
        if (!transaction.type) err.type = "Type is required";
        if (!transaction.rawMessage) err.rawMessage = "Raw message is required";
        if (!transaction.categoryId) err.categoryId = "Category is required";

        return err;
    };

    const updateField = (id: keyof AddTransaction, value: any) => {
        setTransaction((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateField(id as keyof AddTransaction, value);
    };

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        updateField(id as keyof AddTransaction, value === "" ? "" : parseFloat(value));
    };

    const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        updateField(id as keyof AddTransaction, value);
    };

    const handleSubmit = () => {
        const newErrors = validate();

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        const formatted: AddTransaction = {
            ...transaction,
            amount: Number(transaction.amount),
            transactionCost: Number(transaction.transactionCost),
        };

        onSubmit(formatted);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setTransaction(emptyTransaction);
            setErrors({});
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[40vw]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">

                    {/* Transaction ID */}
                    <div className="grid gap-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input id="transactionId" value={transaction.transactionId} onChange={handleInput} />
                        {errors.transactionId && <p className="text-red-500 text-sm">{errors.transactionId}</p>}
                    </div>

                    {/* Amount */}
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={transaction.amount} onChange={handleNumberInput} />
                        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                    </div>

                    {/* Transaction Cost */}
                    <div className="grid gap-2">
                        <Label htmlFor="transactionCost">Transaction Cost</Label>
                        <Input id="transactionCost" type="number" value={transaction.transactionCost} onChange={handleNumberInput} />
                    </div>

                    {/* Date */}
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="datetime-local" value={transaction.date} onChange={handleInput} />
                        {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                    </div>

                    {/* Recipient */}
                    <div className="grid gap-2">
                        <Label htmlFor="recipient">Recipient</Label>
                        <Input id="recipient" value={transaction.recipient} onChange={handleInput} />
                        {errors.recipient && <p className="text-red-500 text-sm">{errors.recipient}</p>}
                    </div>

                    {/* Type */}
                    <div className="grid gap-2 w-full">
                        <Label>Type</Label>
                        <Select
                            value={transaction.type}
                            onValueChange={(value) => updateField("type", value)}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Spent</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                    </div>

                    {/* Category */}
                    <div className="grid gap-2 w-full">
                        <Label>Category</Label>
                        <Select
                            value={transaction.categoryId ? String(transaction.categoryId) : ""}
                            onValueChange={(value) => updateField("categoryId", Number(value))}
                        >
                            <SelectTrigger className={'w-full'}>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
                    </div>

                    {/* Raw Message */}
                    <div className="grid gap-2">
                        <Label htmlFor="rawMessage">Raw Message</Label>
                        <Textarea id="rawMessage" value={transaction.rawMessage} onChange={handleTextarea} rows={6} />
                        {errors.rawMessage && <p className="text-red-500 text-sm">{errors.rawMessage}</p>}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Add Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
