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
import { Category } from "@/Interfaces/Interfaces"
import {useEffect, useState} from "react";
import {Textarea} from "@/components/ui/textarea";

interface CategoryFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (categories: Partial<Category>) => void
    category?: Category | null
}

export function CategoryForm({ isOpen, onClose, onSubmit, category }: CategoryFormProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);


    useEffect(() => {
        if (category) {
            setName(category.name)
            setDescription(category.description)
            setSelectedIcon(category.categoryIcon)
        } else {
            setName("")
            setDescription("")
            setSelectedIcon(null)
        }
    }, [category, isOpen])

    const handleSubmit = () => {
        onSubmit({
            id: category?.id,
            name,
            description,
            categoryIcon: selectedIcon,
        })
    }
    
    // const iconList = Object.keys(Icons).filter(key => typeof Icons[key as keyof typeof Icons] === 'object');


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                        {category ? "Edit the details of your category." : "Add a new category to track your expenses."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className={'grid gap-2'}>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-input text-foreground border-input" />
                    </div>
                    <div className={'grid gap-2'}>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-input text-foreground border-input" />
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
