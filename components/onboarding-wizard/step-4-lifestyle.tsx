"use client"

import { Shirt, Film, Plane, Repeat } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { WizardStepProps } from "./types";

const Step4Lifestyle = ({ formData, handleInputChange }: WizardStepProps) => {
    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-balance">Lifestyle & Extras</h2>
                <p className="mt-2 text-muted-foreground">
                    These expenses help us understand your flexibility and spending patterns.
                </p>
            </div>

            <div className="space-y-6">

                {/* Shopping */}
                <div className="space-y-2">
                    <Label htmlFor="shopping" className="block text-sm font-medium">
                        How much do you spend on shopping monthly?
                    </Label>
                    <div className="relative">
                        <Shirt className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="shopping"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="shopping"
                            value={formData.shopping}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                            focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Entertainment */}
                <div className="space-y-2">
                    <Label htmlFor="entertainment" className="block text-sm font-medium">
                        How much do you spend on entertainment monthly?
                    </Label>
                    <div className="relative">
                        <Film className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="entertainment"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="entertainment"
                            value={formData.entertainment}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                            focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Travel */}
                <div className="space-y-2">
                    <Label htmlFor="travel" className="block text-sm font-medium">
                        How much do you spend on travel monthly?
                    </Label>
                    <div className="relative">
                        <Plane className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="travel"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="travel"
                            value={formData.travel}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-4 text-base placeholder:text-muted-foreground
                            focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                        />
                    </div>
                </div>

                {/* Subscriptions */}
                <div className="space-y-2">
                    <Label htmlFor="subscriptions" className="block text-sm font-medium">
                        How much do you spend on subscriptions monthly?
                    </Label>
                    <div className="relative">
                        <Repeat className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="subscriptions"
                            type="number"
                            min={0}
                            placeholder="0.00"
                            name="subscriptions"
                            value={formData.subscriptions}
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

export default Step4Lifestyle
