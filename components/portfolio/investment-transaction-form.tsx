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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Portfolio, InvestmentTransactionType } from "@/Interfaces/Interfaces"
import { useEffect, useState } from "react"
import { InvestmentTransactionPayload } from "@/components/api-calls/investment-transactions"

interface InvestmentTransactionFormProps {
    isOpen: boolean
    onClose: () => void
    portfolio: Portfolio | null
    onSubmit: (payload: InvestmentTransactionPayload) => void
}

export function InvestmentTransactionForm({
    isOpen,
    onClose,
    portfolio,
    onSubmit,
}: InvestmentTransactionFormProps) {
    const [type, setType] = useState<InvestmentTransactionType>("BUY")
    const [tickerSymbol, setTickerSymbol] = useState("")
    const [units, setUnits] = useState("")
    const [pricePerUnit, setPricePerUnit] = useState("")
    const [amount, setAmount] = useState("")
    const [transactionDate, setTransactionDate] = useState("")
    const [notes, setNotes] = useState("")
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (isOpen) {
            setType("BUY")
            setTickerSymbol(portfolio?.tickerSymbol ?? "")
            setUnits("")
            setPricePerUnit("")
            setAmount("")
            setTransactionDate(toLocalInput(new Date()))
            setNotes("")
            setErrors({})
        }
    }, [isOpen, portfolio])

    const toLocalInput = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const validate = () => {
        const newErrors: { [key: string]: string } = {}
        if (!portfolio) newErrors.portfolio = "No portfolio selected."
        if (!type) newErrors.type = "Type is required."
        if (!amount || Number(amount) <= 0)
            newErrors.amount = "Amount must be greater than 0."
        if (units && Number(units) < 0) newErrors.units = "Units cannot be negative."
        if (pricePerUnit && Number(pricePerUnit) < 0)
            newErrors.pricePerUnit = "Price cannot be negative."
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate() || !portfolio) return
        onSubmit({
            portfolioId: portfolio.id,
            tickerSymbol: tickerSymbol.trim() || portfolio.tickerSymbol,
            type,
            units: units === "" ? null : Number(units),
            pricePerUnit: pricePerUnit === "" ? null : Number(pricePerUnit),
            amount: Number(amount),
            transactionDate: transactionDate ? new Date(transactionDate).toISOString() : null,
            notes: notes.trim() || null,
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>Add Investment Transaction</DialogTitle>
                    <DialogDescription>
                        Record a buy or sell for {portfolio?.name ?? "your portfolio"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value) => setType(value as InvestmentTransactionType)}
                        >
                            <SelectTrigger className="bg-input text-foreground border-input">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUY">Buy</SelectItem>
                                <SelectItem value="SELL">Sell</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="units">Units (optional)</Label>
                            <Input
                                id="units"
                                type="number"
                                step="any"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.units && <p className="text-red-500 text-sm mt-1">{errors.units}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pricePerUnit">Price / unit (optional)</Label>
                            <Input
                                id="pricePerUnit"
                                type="number"
                                step="any"
                                value={pricePerUnit}
                                onChange={(e) => setPricePerUnit(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.pricePerUnit && (
                                <p className="text-red-500 text-sm mt-1">{errors.pricePerUnit}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="1500.00"
                            className="bg-input text-foreground border-input"
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="transactionDate">Transaction Date</Label>
                        <Input
                            id="transactionDate"
                            type="datetime-local"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            className="bg-input text-foreground border-input"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="bg-input text-foreground border-input"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}