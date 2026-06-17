'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Portfolio,
    PortfolioType,
    RootState,
} from "@/Interfaces/Interfaces"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { CreatePortfolioTypeModal } from "@/components/portfolio/create-portfolio-type-modal"

interface PortfolioFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: Partial<Portfolio>) => void
    portfolio?: Portfolio | null
}

const NO_TYPE_VALUE = "__none__"

export function PortfolioForm({ isOpen, onClose, onSubmit, portfolio }: PortfolioFormProps) {
    const [name, setName] = useState("")
    const [tickerSymbol, setTickerSymbol] = useState("")
    const [broker, setBroker] = useState("")
    const [totalUnits, setTotalUnits] = useState("")
    const [totalCostBasis, setTotalCostBasis] = useState("")
    const [currentValue, setCurrentValue] = useState("")
    const [typeId, setTypeId] = useState<string>(NO_TYPE_VALUE)
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const portfolioTypes = useSelector((s: RootState) => s.portfolioTypes.items)
    const referencedType: PortfolioType | null =
        portfolio?.typeId != null
            ? portfolioTypes.find((t) => t.id === portfolio.typeId) ?? null
            : null

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name)
            setTickerSymbol(portfolio.tickerSymbol)
            setBroker(portfolio.broker ?? "")
            setTotalUnits(portfolio.totalUnits ?? "0")
            setTotalCostBasis(portfolio.totalCostBasis ?? "0")
            setCurrentValue(portfolio.currentValue ?? "0")
            setTypeId(
                portfolio.typeId != null ? String(portfolio.typeId) : NO_TYPE_VALUE
            )
        } else {
            setName("")
            setTickerSymbol("")
            setBroker("")
            setTotalUnits("0")
            setTotalCostBasis("0")
            setCurrentValue("0")
            setTypeId(NO_TYPE_VALUE)
        }
        setErrors({})
    }, [portfolio, isOpen])

    const validate = () => {
        const newErrors: { [key: string]: string } = {}
        if (!name.trim()) newErrors.name = "Name is required."
        if (!tickerSymbol.trim()) newErrors.tickerSymbol = "Ticker symbol is required."
        if (!typeId || typeId === NO_TYPE_VALUE) newErrors.typeId = "Type is required."
        const numericFields: { key: string; label: string }[] = [
            { key: "totalUnits", label: "Units" },
            { key: "totalCostBasis", label: "Cost basis" },
            { key: "currentValue", label: "Current value" },
        ]
        for (const f of numericFields) {
            const v = f.key === "totalUnits" ? totalUnits : f.key === "totalCostBasis" ? totalCostBasis : currentValue
            if (v === "" || Number.isNaN(Number(v))) {
                newErrors[f.key] = `${f.label} is required.`
            }
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit({
            id: portfolio?.id,
            name: name.trim(),
            tickerSymbol: tickerSymbol.trim().toUpperCase(),
            broker: broker.trim() || null,
            totalUnits: totalUnits || "0",
            totalCostBasis: totalCostBasis || "0",
            currentValue: currentValue || "0",
            typeId: typeId === NO_TYPE_VALUE ? null : Number(typeId),
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>{portfolio ? "Edit Portfolio" : "Add Portfolio"}</DialogTitle>
                    <DialogDescription>
                        {portfolio
                            ? "Edit the details of your investment portfolio."
                            : "Create a new portfolio to track your investments."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Growth Portfolio"
                            className="bg-input text-foreground border-input"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
                        <Input
                            id="tickerSymbol"
                            value={tickerSymbol}
                            onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
                            placeholder="AAPL"
                            className="bg-input text-foreground border-input uppercase"
                        />
                        {errors.tickerSymbol && (
                            <p className="text-red-500 text-sm mt-1">{errors.tickerSymbol}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="broker">Broker (optional)</Label>
                        <Input
                            id="broker"
                            value={broker}
                            onChange={(e) => setBroker(e.target.value)}
                            placeholder="e.g. Zidiidi"
                            className="bg-input text-foreground border-input"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="typeId">Type</Label>
                        <div className="flex gap-2">
                            <Select value={typeId} onValueChange={setTypeId}>
                                <SelectTrigger className="bg-input text-foreground border-input flex-1">
                                    <SelectValue placeholder="Select a portfolio type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {referencedType && !referencedType.active && (
                                        <SelectItem value={String(referencedType.id)}>
                                            {referencedType.name} (inactive)
                                        </SelectItem>
                                    )}
                                    {portfolioTypes.length === 0 && !referencedType ? (
                                        <SelectItem value={NO_TYPE_VALUE} disabled>
                                            No types available
                                        </SelectItem>
                                    ) : (
                                        portfolioTypes.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsTypeModalOpen(true)}
                                className="gap-1 shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                New type
                            </Button>
                        </div>
                        {errors.typeId && (
                            <p className="text-red-500 text-sm mt-1">{errors.typeId}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="totalUnits">Units</Label>
                            <Input
                                id="totalUnits"
                                type="number"
                                step="any"
                                value={totalUnits}
                                onChange={(e) => setTotalUnits(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.totalUnits && (
                                <p className="text-red-500 text-sm mt-1">{errors.totalUnits}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="totalCostBasis">Cost basis</Label>
                            <Input
                                id="totalCostBasis"
                                type="number"
                                step="any"
                                value={totalCostBasis}
                                onChange={(e) => setTotalCostBasis(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.totalCostBasis && (
                                <p className="text-red-500 text-sm mt-1">{errors.totalCostBasis}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currentValue">Current value</Label>
                            <Input
                                id="currentValue"
                                type="number"
                                step="any"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.currentValue && (
                                <p className="text-red-500 text-sm mt-1">{errors.currentValue}</p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
            <CreatePortfolioTypeModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                onCreated={(createdId) => setTypeId(String(createdId))}
            />
        </Dialog>
    )
}