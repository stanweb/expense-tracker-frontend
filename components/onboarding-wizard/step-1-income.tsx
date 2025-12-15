"use client"

import { DollarSign } from "lucide-react"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import { WizardStepProps } from "./types";

const Step1Income = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">About Your Income</h2>
                <p className="mt-2 text-muted-foreground">
                    Help us understand your financial situation to provide personalized recommendations
                </p>
            </div>

            <div className="space-y-6">
                {/* Primary Income */}
                <div className="space-y-2">
                    <Label htmlFor="primary-income" className="block text-sm font-medium">
                        What's your average monthly take-home income?
                    </Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="primary-income"
                            min={0}
                            type="number"
                            placeholder="0.00"
                            name="income"
                            value={formData.income}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Additional Income Toggle */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                    <input
                        id="additional-income-toggle"
                        type="checkbox"
                        name="hasAdditionalIncome"
                        checked={formData.hasAdditionalIncome}
                        onChange={handleInputChange}
                        className="mt-0.5 size-4 cursor-pointer rounded border-input accent-primary"
                    />
                    <label htmlFor="additional-income-toggle" className="flex-1 cursor-pointer">
                        <span className="block text-sm font-medium">Do you have any additional income sources?</span>
                        <span className="text-sm text-muted-foreground">
              This could include freelance work, rental income, investments, etc.
            </span>
                    </label>
                </div>

                {/* Additional Income Amount */}
                {formData.hasAdditionalIncome && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label htmlFor="additional-income" className="block text-sm font-medium">
                            How much extra do you earn monthly?
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                id="additional-income"
                                type="number"
                                placeholder="0.00"
                                name="additionalIncome"
                                value={formData.additionalIncome}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Step1Income
