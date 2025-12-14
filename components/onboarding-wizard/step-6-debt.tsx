"use client"

import { Wallet } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WizardStepProps } from "./types";

const Step6Debt = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">Debt Situation</h2>
                <p className="mt-2 text-muted-foreground">
                    Understanding any current loans helps us build a complete picture of your finances.
                </p>
            </div>

            <div className="space-y-6">
                {/* Monthly Debt Payment */}
                <div className="space-y-2">
                    <Label htmlFor="debt" className="block text-sm font-medium">
                        How much do you pay monthly toward debt?
                    </Label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="debt"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="debt"
                            value={formData.debt}
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

export default Step6Debt
