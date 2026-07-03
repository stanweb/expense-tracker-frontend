'use client'

import { useEffect, useState } from "react"
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
import { Goal, GoalPayload, GoalStatus } from "@/Interfaces/Interfaces"

interface GoalFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: GoalPayload, existing?: Goal | null) => void
    goal?: Goal | null
}

const STATUS_VALUES: GoalStatus[] = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]

const toDateInput = (value: string | null | undefined): string => {
    if (!value) return ""
    // Accept both "YYYY-MM-DD" and ISO timestamps; normalise to the date part.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
}

const toIsoDate = (value: string): string => {
    // `<Input type="date">` returns "YYYY-MM-DD". Persist as ISO date-only.
    if (!value) return value
    return value
}

export function GoalForm({ isOpen, onClose, onSubmit, goal }: GoalFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [startDate, setStartDate] = useState("")
    const [targetDate, setTargetDate] = useState("")
    const [status, setStatus] = useState<GoalStatus>("ACTIVE")
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (goal) {
            setName(goal.name)
            setDescription(goal.description ?? "")
            setTargetAmount(String(goal.targetAmount ?? ""))
            setStartDate(toDateInput(goal.startDate))
            setTargetDate(toDateInput(goal.targetDate))
            setStatus(goal.status)
        } else {
            setName("")
            setDescription("")
            setTargetAmount("")
            setStartDate("")
            setTargetDate("")
            setStatus("ACTIVE")
        }
        setErrors({})
    }, [goal, isOpen])

    const validate = () => {
        const newErrors: { [key: string]: string } = {}
        if (!name.trim()) newErrors.name = "Name is required."
        const amount = Number(targetAmount)
        if (targetAmount === "" || Number.isNaN(amount) || amount <= 0) {
            newErrors.targetAmount = "Target amount must be greater than 0."
        }
        if (!startDate) newErrors.startDate = "Start date is required."
        if (!targetDate) newErrors.targetDate = "Target date is required."
        if (
            startDate &&
            targetDate &&
            new Date(targetDate).getTime() < new Date(startDate).getTime()
        ) {
            newErrors.targetDate = "Target date must be on or after the start date."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        if (goal) {
            // Update: send every field so the user can edit any of them.
            onSubmit(
                {
                    name: name.trim(),
                    description: description.trim() || null,
                    targetAmount: Number(targetAmount),
                    startDate: toIsoDate(startDate),
                    targetDate: toIsoDate(targetDate),
                    status,
                },
                goal
            )
        } else {
            // Create: backend defaults status to ACTIVE; only send editable fields.
            onSubmit({
                name: name.trim(),
                description: description.trim() || null,
                targetAmount: Number(targetAmount),
                startDate: toIsoDate(startDate),
                targetDate: toIsoDate(targetDate),
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>{goal ? "Edit Goal" : "Add Goal"}</DialogTitle>
                    <DialogDescription>
                        {goal
                            ? "Update the details of your savings goal."
                            : "Set up a new savings target and start tracking your progress."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="goal-name">Name</Label>
                        <Input
                            id="goal-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Buy a car"
                            maxLength={100}
                            className="bg-input text-foreground border-input"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal-description">Description (optional)</Label>
                        <Textarea
                            id="goal-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Save for a Toyota"
                            className="bg-input text-foreground border-input"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="goal-target">Target amount</Label>
                        <Input
                            id="goal-target"
                            type="number"
                            step="any"
                            min="0"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="20000.00"
                            className="bg-input text-foreground border-input"
                        />
                        {errors.targetAmount && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.targetAmount}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="goal-start">Start date</Label>
                            <Input
                                id="goal-start"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.startDate}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goal-target-date">Target date</Label>
                            <Input
                                id="goal-target-date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="bg-input text-foreground border-input"
                            />
                            {errors.targetDate && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.targetDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {goal && (
                        <div className="grid gap-2">
                            <Label htmlFor="goal-status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(v) => setStatus(v as GoalStatus)}
                            >
                                <SelectTrigger
                                    id="goal-status"
                                    className="bg-input text-foreground border-input"
                                >
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_VALUES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s.charAt(0) + s.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
