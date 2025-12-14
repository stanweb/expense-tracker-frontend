"use client"

import { PiggyBank, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WizardStepProps } from "./types";

const Step5FinancialGoals = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">Your Financial Goals</h2>
                <p className="mt-2 text-muted-foreground">
                    Let us know what you want to achieve so we can guide you more effectively.
                </p>
            </div>

            <div className="space-y-6">

                {/* Monthly Savings Amount */}
                <div className="space-y-2">
                    <Label htmlFor="savings" className="block text-sm font-medium">
                        How much would you like to save monthly?
                    </Label>
                    <div className="relative">
                        <PiggyBank className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="savings"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="savings"
                            value={formData.savings}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                                focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Monthly Investments Amount */}
                <div className="space-y-2">
                    <Label htmlFor="investments" className="block text-sm font-medium">
                        How much would you like to invest monthly?
                    </Label>
                    <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="investments"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="investments"
                            value={formData.investments}
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

export default Step5FinancialGoals
