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
import axioClient from "@/utils/apiClient";
import { BudgetForm } from "@/components/budget/budget-form";
import { BudgetsTableSkeleton } from "@/components/budget/budgets-table-skeleton";
import { BudgetProgressSlider } from "@/components/budget/budget-progress-slider";
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
    const [prefillCategoryId, setPrefillCategoryId] = useState<number | null>(null)
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const userId = useSelector((state: RootState) => state.user.userId);
    const {showToast} = useToast()

    const fetchBudgets = async (month: string, year: string) => {
        setLoading(true);
        try {
            const response = await axioClient.get<Budget[]>(`users/${userId}/budgets?month=${month}&year=${year}`)
            setBudgets(response.data || [])
            const lastMonthBudget = await axioClient.get(`users/${userId}/budgets?month=${Number(month) - 1}&year=${year}`)
            setLastMonthBudget(lastMonthBudget.data || [])
        } catch (error) {
            console.error("Error fetching budgets:", error)
            setBudgets([])
        } finally {
            setLoading(false);
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
        setPrefillCategoryId(null)
        setIsFormOpen(true)
    }

    const handleBudgetCategory = (categoryId: number) => {
        setSelectedBudget(null)
        setPrefillCategoryId(categoryId)
        setIsFormOpen(true)
    }

    const unbudgetedCategories = categories.filter(
        (category) => !budgets.some((budget) => budget.categoryId === category.id)
    )

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
                    {loading ? (
                        <BudgetsTableSkeleton count={5} />
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No budgets found for {formatMonth(Number(selectedMonth))} {selectedYear}.
                            Start by adding a new budget or copying from last month.
                        </div>
                    ) : (
                        <>
                        {unbudgetedCategories.length > 0 && (
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            Categories not yet budgeted
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {unbudgetedCategories.length} {unbudgetedCategories.length === 1 ? "category" : "categories"} without a budget for {formatMonth(Number(selectedMonth))} {selectedYear}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {unbudgetedCategories.map((category) => {
                                        const Icon = getIcon(category.categoryIcon || '')
                                        return (
                                            <div
                                                key={category.id}
                                                className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                                                    <span className="text-sm font-medium text-foreground truncate">
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shrink-0"
                                                    onClick={() => handleBudgetCategory(category.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Set budget
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        <Table className="rounded-lg">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden md:table-cell">Spent</TableHead>
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
                                        <TableCell className="hidden md:table-cell">
                                            <BudgetProgressSlider
                                                amount={budget.amount}
                                                spent={budget.totalSpent ?? 0}
                                            />
                                        </TableCell>
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
                                                <DropdownMenuContent align="end" className="min-w-[180px] p-1.5 shadow-lg ring-1 ring-border/40">
                                                    <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                        Budget actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="my-1" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(budget)}
                                                        className="cursor-pointer gap-3 rounded-md px-2.5 py-2 text-sm font-medium focus:bg-accent/70"
                                                    >
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </span>
                                                        <span>Edit</span>
                                                        <span className="ml-auto text-[11px] font-normal text-muted-foreground">⌘E</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => handleDelete(budget.id)}
                                                        className="cursor-pointer gap-3 rounded-md px-2.5 py-2 text-sm font-medium"
                                                    >
                                                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </span>
                                                        <span>Delete</span>
                                                        <span className="ml-auto text-[11px] font-normal opacity-70">⌘⌫</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    )})}
                            </TableBody>
                        </Table>
                        </>
                    )}
                    <BudgetForm
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={handleSubmit}
                        budget={selectedBudget}
                        categories={categories}
                        prefillCategoryId={prefillCategoryId}
                    />
                </CardContent>
            </Card>

        </div>
    )
}
