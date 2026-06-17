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
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/Interfaces/Interfaces"
import { upsertPortfolioType } from "@/store/portfolio-types-slice"
import { createPortfolioType } from "@/components/api-calls/portfolio-types"
import { usePortfolioTypes } from "@/hooks/use-portfolio-types"
import { useToast } from "@/components/ui/ToastProvider"

interface CreatePortfolioTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated?: (typeId: number) => void
}

export function CreatePortfolioTypeModal({
    isOpen,
    onClose,
    onCreated,
}: CreatePortfolioTypeModalProps) {
    const userId = useSelector((s: RootState) => s.user.userId)
    const dispatch = useDispatch()
    const { refresh } = usePortfolioTypes()
    const { showToast } = useToast()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [active, setActive] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (isOpen) {
            setName("")
            setDescription("")
            setActive(true)
            setErrors({})
        }
    }, [isOpen])

    const validate = () => {
        const newErrors: { [key: string]: string } = {}
        if (!name.trim()) newErrors.name = "Name is required."
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate() || !userId) return
        setSubmitting(true)
        try {
            const created = await createPortfolioType(userId, {
                name: name.trim().toUpperCase(),
                description: description.trim() || null,
                active,
            })
            dispatch(upsertPortfolioType(created))
            await refresh()
            showToast({
                title: "Success!",
                description: `Portfolio type "${created.name}" created.`,
                variant: "success",
                duration: 5000,
            })
            onCreated?.(created.id)
            onClose()
        } catch (error: any) {
            showToast({
                title: "Error!",
                description:
                    error?.response?.data?.message || "Failed to create portfolio type.",
                variant: "error",
                duration: 5000,
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>New Portfolio Type</DialogTitle>
                    <DialogDescription>
                        Define a new classification for your portfolios.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="pt-name">Name</Label>
                        <Input
                            id="pt-name"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            placeholder="CRYPTO"
                            className="bg-input text-foreground border-input uppercase"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pt-description">Description (optional)</Label>
                        <Textarea
                            id="pt-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="bg-input text-foreground border-input"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                        />
                        <span>Active (available for new portfolios)</span>
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={() => void handleSubmit()} disabled={submitting}>
                        {submitting ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}