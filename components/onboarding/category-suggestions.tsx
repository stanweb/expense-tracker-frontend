"use client"

import  React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {LucideIcon} from "lucide-react";
import {getIcon} from "@/utils/helpers";



interface Category {
    name: string
    categoryIcon: string
    description: string
}

interface CategorySuggestionsProps {
    categories: Category[]
}

const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({ categories }) => {
    return (
        <Card>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                    {categories.map((category) => {
                        const Icon: LucideIcon = getIcon(category.categoryIcon) as LucideIcon;
                        return (
                        <div
                            key={category.name}
                            className="group flex items-start gap-3 rounded-lg border border-border hover:scale-105
                            bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="flex-shrink-0 rounded-full bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground leading-tight mb-1">{category.name}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                            </div>
                        </div>
                        )
                })}
                </div>
                {/* </CHANGE> */}
            </CardContent>
        </Card>
    )
}

export default CategorySuggestions
