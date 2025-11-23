'use client'

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
import { Budget, Category } from "@/Interfaces/Interfaces"
import {useEffect, useState} from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axioClient from "@/utils/axioClient";
import { MONTHS, YEARS } from "@/utils/constants";

interface BudgetFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (budget: Partial<Budget>) => void
    budget?: Budget | null
}

export function BudgetForm({ isOpen, onClose, onSubmit, budget }: BudgetFormProps) {
    const [amount, setAmount] = useState<number | string>("")
    const [month, setMonth] = useState<string>("")
    const [year, setYear] = useState<string>("")
    const [categoryId, setCategoryId] = useState<string>("")
    const [categories, setCategories] = useState<Category[]>([])
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen) {
            axioClient.get<Category[]>("users/1/categories").then((res) => {
                setCategories(res.data || [])
            })
        }
    }, [isOpen])

    useEffect(() => {
        if (budget) {
            setAmount(budget.amount)
            setMonth(String(budget.month))
            setYear(String(budget.year))
            setCategoryId(String(budget.categoryId))
        } else {
            setAmount("")
            const today = new Date();
            setMonth(String(today.getMonth() + 1));
            setYear(String(today.getFullYear()));
            setCategoryId("")
        }
        setErrors({}); // Clear errors when dialog opens or budget changes
    }, [budget, isOpen])

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!amount || Number(amount) <= 0) {
            newErrors.amount = "Amount is required and must be greater than 0.";
        }
        if (!month) {
            newErrors.month = "Month is required.";
        }
        if (!year) {
            newErrors.year = "Year is required.";
        }
        if (!categoryId) {
            newErrors.categoryId = "Category is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                id: budget?.id,
                amount: Number(amount),
                month: Number(month),
                year: Number(year),
                categoryId: Number(categoryId),
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>{budget ? "Edit Budget" : "Add Budget"}</DialogTitle>
                    <DialogDescription>
                        {budget ? "Edit the details of your budget." : "Add a new budget to track your expenses."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-input text-foreground border-input" />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <Label htmlFor="month">Month</Label>
                        <Select onValueChange={setMonth} value={month}>
                            <SelectTrigger className="w-full bg-input text-foreground border-input">
                                <SelectValue placeholder="Select a month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                    </div>
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Select onValueChange={setYear} value={year}>
                            <SelectTrigger className="w-full bg-input text-foreground border-input">
                                <SelectValue placeholder="Select a year" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEARS.map((y) => (
                                    <SelectItem key={y} value={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select onValueChange={setCategoryId} value={categoryId}>
                            <SelectTrigger className="w-full bg-input text-foreground border-input">
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
                        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
