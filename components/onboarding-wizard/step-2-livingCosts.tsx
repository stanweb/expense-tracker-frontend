"use client"

import { Home, Plug, Car } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WizardStepProps } from "./types";

const Step2LivingCosts = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">Your Living Costs</h2>
                <p className="mt-2 text-muted-foreground">
                    These expenses help us understand your essential monthly obligations.
                </p>
            </div>

            <div className="space-y-6">

                {/* Rent / Mortgage */}
                <div className="space-y-2">
                    <Label htmlFor="rent" className="block text-sm font-medium">
                        How much do you pay for rent or mortgage?
                    </Label>
                    <div className="relative">
                        <Home className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="rent"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="rent"
                            value={formData.rent}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base transition-colors placeholder:text-muted-foreground
                        focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Utilities */}
                <div className="space-y-2">
                    <Label htmlFor="utilities" className="block text-sm font-medium">
                        How much do you spend on utilities each month?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Electricity, water, internet, garbage collection, etc.
                    </p>
                    <div className="relative">
                        <Plug className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="utilities"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="utilities"
                            value={formData.utilities}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base transition-colors placeholder:text-muted-foreground
                        focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Transportation */}
                <div className="space-y-2">
                    <Label htmlFor="transportation" className="block text-sm font-medium">
                        How much do you spend on transportation each month?
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Gas, public transit, ride-sharing, etc.
                    </p>
                    <div className="relative">
                        <Car className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="transportation"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="transportation"
                            value={formData.transportation}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base transition-colors placeholder:text-muted-foreground
                        focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Step2LivingCosts
