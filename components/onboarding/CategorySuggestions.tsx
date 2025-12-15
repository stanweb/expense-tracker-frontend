"use client"

import  React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {
    Home,
    Building,
    CookingPot,
    Utensils,
    ShoppingCart,
    ShoppingBag,
    Fuel,
    Car,
    Bus,
    Plane,
    Plug,
    Wifi,
    Smartphone,
    Tv,
    Gamepad2,
    Film,
    PiggyBank,
    Baseline as ChartLine,
    Wallet,
    CreditCard,
    Receipt,
    HandHeart,
    Users,
    Shield,
    GraduationCap,
    Briefcase,
    HeartPulse,
    Calculator
} from "lucide-react";

export const iconMap: Record<string, JSX.Element> = {
    Home: <Home className="w-5 h-5" />,
    Building: <Building className="w-5 h-5" />,
    CookingPot: <CookingPot className="w-5 h-5" />,
    Utensils: <Utensils className="w-5 h-5" />,
    ShoppingCart: <ShoppingCart className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Fuel: <Fuel className="w-5 h-5" />,
    Car: <Car className="w-5 h-5" />,
    Bus: <Bus className="w-5 h-5" />,
    Plane: <Plane className="w-5 h-5" />,
    Plug: <Plug className="w-5 h-5" />,
    Wifi: <Wifi className="w-5 h-5" />,
    Smartphone: <Smartphone className="w-5 h-5" />,
    Tv: <Tv className="w-5 h-5" />,
    Gamepad2: <Gamepad2 className="w-5 h-5" />,
    Film: <Film className="w-5 h-5" />,
    PiggyBank: <PiggyBank className="w-5 h-5" />,
    ChartLine: <ChartLine className="w-5 h-5" />,
    Wallet: <Wallet className="w-5 h-5" />,
    CreditCard: <CreditCard className="w-5 h-5" />,
    Receipt: <Receipt className="w-5 h-5" />,
    HandHeart: <HandHeart className="w-5 h-5" />,
    Users: <Users className="w-5 h-5" />,
    Shield: <Shield className="w-5 h-5" />,
    GraduationCap: <GraduationCap className="w-5 h-5" />,
    Briefcase: <Briefcase className="w-5 h-5" />,
    HeartPulse: <HeartPulse className="w-5 h-5" />,
    Calculator: <Calculator className="w-5 h-5" />
};


interface Category {
    name: string
    categoryIcon: keyof typeof iconMap
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
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="group flex items-start gap-3 rounded-lg border border-border hover:scale-105
                            bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                        >
                            <div className="flex-shrink-0 rounded-full bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                                {iconMap[category.categoryIcon] ?? <Wallet className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground leading-tight mb-1">{category.name}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* </CHANGE> */}
            </CardContent>
        </Card>
    )
}

export default CategorySuggestions
