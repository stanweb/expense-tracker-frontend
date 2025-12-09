'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RootState, UiTransaction } from '@/Interfaces/Interfaces';
import axioClient from '@/utils/axioClient';
import { getIcon } from '@/utils/helpers';
import { useSelector } from 'react-redux';


interface Category {
    id: string;
    name: string;
    icon: string;
}

interface EditTransactionCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: UiTransaction | null;
    onSuccess: () => void;
}

export const EditTransactionCategoryModal = ({
    isOpen,
    onClose,
    transaction,
    onSuccess,
}: EditTransactionCategoryModalProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = useSelector((state: RootState) => state.user.userId);

    // Fetch categories only once when the component mounts
    useEffect(() => {
        if (!userId) return;
        axioClient.get<Category[]>(`/users/${userId}/categories`)
            .then((res) => {
                setCategories(res.data);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setError("Failed to load categories.");
            });
    }, [userId]); // Empty dependency array means this effect runs once on mount

    // Set initial selected category when transaction or categories change
    useEffect(() => {
        if (transaction && categories.length > 0) {
            const initialCategory = categories.find(cat => cat.name === transaction.category);
            setSelectedCategoryId(initialCategory?.id || undefined);
        }
    }, [transaction, categories]); // Depend on transaction and categories

    const handleSave = async () => {
        if (!transaction || !selectedCategoryId || !userId) return;

        setLoading(true);
        setError(null);
        try {
            await axioClient.put(`/users/${userId}/transactions/${transaction.id}`, {
                categoryId: selectedCategoryId,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error updating transaction category:", err);
            setError(err.message || "Failed to update category.");
        } finally {
            setLoading(false);
        }
    };

    if (!transaction) return null; // Don't render if no transaction is provided

    // Note: CurrentIcon is not used in the current JSX, but keeping it for context if needed elsewhere.
    // const CurrentIcon: LucideIcon = getIcon(transaction.icon as unknown as string);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[40vw]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction Category</DialogTitle>
                    <DialogDescription>
                        Make changes to the category of your transaction here.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Description
                        </Label>
                        <p className="col-span-3">{transaction.name}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <p className="col-span-3">KES {transaction.amount.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center">
                                            {/* Assuming getIcon can take category.icon string */}
                                            {/*{getIcon(category.icon) && (*/}
                                            {/*    <span className="mr-2">*/}
                                            {/*        {getIcon(category.icon)({ size: 16 })}*/}
                                            {/*    </span>*/}
                                            {/*)}*/}
                                            {category.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !selectedCategoryId}>
                        {loading ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
