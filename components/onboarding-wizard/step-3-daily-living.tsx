"use client"

import { ShoppingCart, Utensils } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WizardStepProps } from "./types";

const Step3DailyLiving = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">Daily Living Expenses</h2>
                <p className="mt-2 text-muted-foreground">
                    We’ll use this information to understand your everyday spending habits.
                </p>
            </div>

            <div className="space-y-6">

                {/* Groceries */}
                <div className="space-y-2">
                    <Label htmlFor="groceries" className="block text-sm font-medium">
                        What’s your average monthly grocery spending?
                    </Label>
                    <div className="relative">
                        <ShoppingCart className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="groceries"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="groceries"
                            value={formData.groceries}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                        focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Dining Out */}
                <div className="space-y-2">
                    <Label htmlFor="diningOut" className="block text-sm font-medium">
                        How much do you spend on dining out monthly?
                    </Label>
                    <div className="relative">
                        <Utensils className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="diningOut"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="diningOut"
                            value={formData.diningOut}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                        focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step3DailyLiving
