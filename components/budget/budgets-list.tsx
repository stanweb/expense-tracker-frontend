'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {Budget, Category, RootState} from "@/Interfaces/Interfaces"
import {useEffect, useState} from "react";
import axioClient from "@/utils/servicesAxiosClient";
import { BudgetForm } from "@/components/budget/budget-form";
import { Copy, MoreHorizontal, Pencil, Plus, Trash2} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MONTHS, YEARS } from "@/utils/constants";
import {useSelector} from "react-redux";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {getCategories} from "@/components/api-calls/categories";
import {getIcon} from "@/utils/helpers";
import {useToast} from "@/components/ui/ToastProvider";

export function BudgetsList() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [lastMonthBudget, setLastMonthBudget] = useState<Budget[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [categories, setCategories] = useState<Category[]>([])
    const userId = useSelector((state: RootState) => state.user.userId);
    const {showToast} = useToast()

    const fetchBudgets = async (month: string, year: string) => {
        try {
            const response = await axioClient.get<Budget[]>(`users/${userId}/budgets?month=${month}&year=${year}`)
            setBudgets(response.data || [])
            const lastMonthBudget = await axioClient.get(`users/${userId}/budgets?month=${Number(month) - 1}&year=${year}`)
            setLastMonthBudget(lastMonthBudget.data || [])
        } catch (error) {
            console.error("Error fetching budgets:", error)
            setBudgets([])
        }
    }
    const fetchCategories = async () => {
        const categories = await getCategories(userId)
        setCategories(categories)
    }

    useEffect(() => {
        void fetchBudgets(selectedMonth, selectedYear)
    }, [selectedMonth, selectedYear])

    useEffect(() => {
        void fetchCategories()
    }, [userId, isFormOpen]);

    const handleAdd = () => {
        setSelectedBudget(null)
        setIsFormOpen(true)
    }

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: number) => {
        try {
            await axioClient.delete(`users/${userId}/budgets/${id}`)
            await fetchBudgets(selectedMonth, selectedYear)
            showToast({
                title: "Success!",
                description: ` ${budgets.find(budget => budget.id === id)?.categoryName} budget deleted`,
                variant: "success",
                duration: 5000,
            })
        } catch (error:any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while deleting",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const handleSubmit = async (budget: Partial<Budget>) => {
        try {
            if (budget.id) {
                await axioClient.put(`users/${userId}/budgets/${budget.id}`, budget)
                showToast({
                    title: "Success!",
                    description: "Your budget has been updated.",
                    variant: "success",
                    duration: 5000,
                })
            } else {
                await axioClient.post(`users/${userId}/budgets`, budget)
                showToast({
                    title: "Success!",
                    description: "Your budget has been saved.",
                    variant: "success",
                    duration: 5000,
                })
            }
            await fetchBudgets(selectedMonth, selectedYear)
            setIsFormOpen(false)
        } catch (error:any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while saving your budget.",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const handleCopyLastMonth = async () => {
        try {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthYear = lastMonth.getFullYear();
            const lastMonthMonth = lastMonth.getMonth() + 1;

            const response = await axioClient.get<Budget[]>(`users/1/budgets?month=${lastMonthMonth}&year=${lastMonthYear}`);
            const lastMonthBudgets = response.data || [];

            const newBudgets = lastMonthBudgets.map(b => ({
                ...b,
                id: undefined,
                month: today.getMonth() + 1,
                year: today.getFullYear(),
            }));

            await axioClient.post(`users/${userId}/budgets/batch`, newBudgets);

            await fetchBudgets(selectedMonth, selectedYear);
        } catch (error) {
            console.error("Error copying last month's budgets:", error);
        }
    }

    const formatMonth = (month: number) => {
        return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
    }

    return (
        <div className={'container mx-auto py-8 px-4 sm:px-8 max-w-7xl'}>
            <Card className={'px-4 sm:px-8'}>
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">Budgets</CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-1.5">
                        Manage and organize your financial Budgets
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                                <Label htmlFor="month-filter">Month</Label>
                                <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="year-filter">Year</Label>
                                <Select onValueChange={setSelectedYear} value={selectedYear}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YEARS.map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {lastMonthBudget.length > 0 && 
                            <>
                                <Button onClick={handleCopyLastMonth} variant="outline" size="icon" className="sm:hidden">
                                    <Copy className="h-4 w-4"/>
                                </Button>
                                <Button onClick={handleCopyLastMonth} variant="outline" className="hidden sm:flex">
                                    <Copy className="mr-2 h-4 w-4"/>
                                    Copy Last Month's Budgets
                                </Button>
                            </>
                             }

                            <Button
                                disabled={categories.length == budgets.length}
                                className={'cursor-pointer sm:hidden'}
                                size="icon"
                                onClick={handleAdd}>
                                <Plus className="h-4 w-4"/>
                            </Button>
                            <Button
                                disabled={categories.length == budgets.length}
                                className={'cursor-pointer hidden sm:flex'}
                                onClick={handleAdd}>

                                <Plus className="mr-2 h-4 w-4"/>
                                Add Budget
                            </Button>
                        </div>
                    </div>
                    {budgets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No budgets found for {formatMonth(Number(selectedMonth))} {selectedYear}.
                            Start by adding a new budget or copying from last month.
                        </div>
                    ) : (
                        <Table className="rounded-lg">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden sm:table-cell">Month</TableHead>
                                    <TableHead className="hidden sm:table-cell">Year</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {budgets.map((budget) => {
                                    const Icon = getIcon(categories.find(c => c.id === budget.categoryId)?.categoryIcon || '')
                                    return (
                                    <TableRow key={budget.id}>

                                            <TableCell className={"whitespace-pre-wrap break-words flex items-center"}>
                                                <Icon className="h-5 w-5 text-primary mr-2"/>
                                                {budget.categoryName}
                                            </TableCell>
                                        <TableCell>{budget.amount}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{formatMonth(budget.month)}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{budget.year}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                                        <Pencil className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDelete(budget.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    )})}
                            </TableBody>
                        </Table>
                    )}
                    <BudgetForm
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={handleSubmit}
                        budget={selectedBudget}
                        categories={categories}
                    />
                </CardContent>
            </Card>

        </div>
    )
}
