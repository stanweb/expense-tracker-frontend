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
import { Category } from "@/Interfaces/Interfaces"
import {useEffect, useState} from "react";
import axioClient from "@/utils/axioClient";
import { CategoryForm } from "@/components/category-form";
import {Dropdown} from "react-day-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {MoreHorizontal, Pencil, Plus, Search, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";

export function CategoriesList() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchCategories = async () => {
        try {
            const response = await axioClient.get<Category[]>("users/1/categories")
            setCategories(response.data || [])
        } catch (error) {
            console.error("Error fetching categories:", error)
            setCategories([])
        }
    }

    useEffect(() => {
        void fetchCategories()
    }, [])

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
        try {
            await axioClient.delete(`users/1/categories/${id}`)
            await fetchCategories()
        } catch (error) {
            console.error("Error deleting category:", error)
        }
    }

    const handleSubmit = async (category: Partial<Category>) => {
        try {
            if (category.id) {
                await axioClient.put(`users/1/categories/${category.id}`, category)
            } else {
                await axioClient.post("users/1/categories", category)
            }
            await fetchCategories()
            setIsFormOpen(false)
        } catch (error) {
            console.error("Error saving category:", error)
        }
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add Category
                </Button>
            </div>
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
            </div>
            <Table className="bg-gray-800 rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            {/*<TableCell>*/}
                            {/*    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(category)}>*/}
                            {/*        Edit*/}
                            {/*    </Button>*/}
                            {/*    <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>*/}
                            {/*        Delete*/}
                            {/*    </Button>*/}
                            {/*</TableCell>*/}
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CategoryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
                category={selectedCategory}
            />
        </div>
    )
}
