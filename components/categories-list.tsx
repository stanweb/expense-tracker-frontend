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
import { Category, RootState } from "@/Interfaces/Interfaces"
import {useEffect, useState} from "react";
import axioClient from "@/utils/servicesAxiosClient";
import { CategoryForm } from "@/components/category-form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {LucideIcon, MoreHorizontal, Pencil, Plus, Search, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import { useSelector } from "react-redux";
import { addCategory, getCategories } from "./api-calls/categories";
import aiAxiosClient from "@/utils/aiAxioClient";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useToast} from "@/components/ui/ToastProvider";
import {getIcon} from "@/utils/helpers";

export function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const userId = useSelector((state: RootState) => state.user.userId);

    const fetchCategories = async () => {
        if (!userId) return;
        try {
            const fetchedCategories = await getCategories(userId);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error("Error fetching categories:", error)
            setCategories([])
        }
    }

    useEffect(() => {
        void fetchCategories()
    }, [userId])

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    const handleAdd = () => {
        setSelectedCategory(null)
        setIsFormOpen(true)
    }

    const handleEdit = (category: Category) => {
        setSelectedCategory(category)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!userId) return;
        try {
            await axioClient.delete(`users/${userId}/categories/${id}`)
            showToast({
                title: "Success!",
                description: ` ${categories.find(category => category.id === id)?.name} category has been deleted.`,
                variant: "success",
                duration: 5000,
            })
            await fetchCategories()
        } catch (error: any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while deleting",
                variant: "error",
                duration: 5000,
            })
        }
    }

    const handleSubmit = async (category: Partial<Category>) => {
        if (!userId) return;
        const {data} = await aiAxiosClient.post('/ai/get-icon', {
            name: category.name,
            description: category.description
        })
        try {
            if (category.id) {
                await axioClient.put(`users/${userId}/categories/${category.id}`, {... category, categoryIcon: data.iconName})
            } else {
                await addCategory(userId, {
                    name: category.name!,
                    description: category.description!,
                    categoryIcon: data.iconName || null,
                });
            }
            showToast({
                title: "Success!",
                description: "Your category has been saved.",
                variant: "success",
                duration: 5000,
            })
            await fetchCategories()
            setIsFormOpen(false)
        } catch (error: any) {
            showToast({
                title: "Error!",
                description: error.response.data.message || "An error occurred while saving your category.",
                variant: "error",
                duration: 5000,
            })
            console.error("Error saving category:", error)
        }
    }

    return (
        <div className={'container mx-auto py-8 px-4 sm:px-8 max-w-7xl'}>
            <Card className={'px-4 sm:px-8'}>
                <CardHeader className="space-y-1 pb-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight">Categories</CardTitle>
                            <CardDescription className="text-sm sm:text-base mt-1.5">
                                Manage and organize your financial categories
                            </CardDescription>
                        </div>
                        <Button onClick={handleAdd} size="default" className="gap-2 mt-4 sm:mt-0">
                            <Plus className="h-4 w-4" />
                            <span className="sm:inline">Add Category</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center mb-6">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search categories..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={'mx-5'}>
                            <p className={'text-muted-foreground text-sm'}>You have {categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
                        </div>
                    </div>
                    <Table className="rounded-lg">
                        <TableHeader>
                            <TableRow className={'hover:bg-transparent border'}>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold hidden sm:table-cell">Description</TableHead>
                                <TableHead className="w-[70px]">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => {
                                const Icon = getIcon(category.categoryIcon || 'CreditCard') as LucideIcon;
                                return (
                                <TableRow key={category.id} className={'hover:bg-transparent border'}>
                                    <TableCell className="whitespace-pre-wrap break-words flex items-center">
                                        <Icon className="h-5 w-5 text-primary mr-2"/>
                                        {category.name}</TableCell>
                                    <TableCell
                                        className="whitespace-pre-wrap break-words hidden sm:table-cell">{category.description}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span
                                                        className="sr-only h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    <CategoryForm
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={handleSubmit}
                        category={selectedCategory}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
