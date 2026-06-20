'use client';

import { useEffect, useState } from 'react';
import {Loader2, Tag, AlertCircle} from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Category, RootState, UiTransaction } from '@/Interfaces/Interfaces';
import axioClient from '@/utils/apiClient';
import { getIcon } from '@/utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { setTransactionTrigger } from '@/store/date-slice';
import { useToast } from '@/components/ui/ToastProvider';

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
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userId = useSelector((state: RootState) => state.user.userId);
    const dispatch = useDispatch();
    const { showToast } = useToast();

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setCategoriesLoading(true);
        axioClient
            .get<Category[]>(`/users/${userId}/categories`)
            .then((res) => {
                if (!cancelled) setCategories(res.data);
            })
            .catch(() => {
                if (!cancelled) setError('Failed to load categories.');
            })
            .finally(() => {
                if (!cancelled) setCategoriesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        if (transaction && categories.length > 0) {
            const initial = categories.find((c) => c.name === transaction.category);
            setSelectedCategoryId(initial?.id);
        }
        if (!transaction) {
            setSelectedCategoryId(undefined);
            setError(null);
        }
    }, [transaction, categories]);

    const handleSave = async () => {
        if (!transaction || !selectedCategoryId || !userId) return;
        setLoading(true);
        setError(null);
        try {
            await axioClient.put(`/users/${userId}/transactions/${transaction.id}`, {
                categoryId: selectedCategoryId,
            });
            showToast({
                title: 'Category updated',
                description: 'The transaction category has been updated.',
                variant: 'success',
                duration: 4000,
            });
            onSuccess();
            onClose();
            dispatch(setTransactionTrigger(Date.now().toString()));
        } catch (err: any) {
            showToast({
                title: 'Update failed',
                description: err.response?.data?.message || 'Failed to update category',
                variant: 'error',
                duration: 5000,
            });
            setError(err.response?.data?.message || 'Failed to update category.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError(null);
            setSelectedCategoryId(undefined);
            onClose();
        }
    };

    if (!transaction) return null;

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const SelectedIcon = selectedCategory?.categoryIcon ? getIcon(selectedCategory.categoryIcon) : null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Edit Category
                    </DialogTitle>
                    <DialogDescription>
                        Reassign this transaction to a different category.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {transaction.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {transaction.date}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-base font-semibold text-foreground">
                                KES {transaction.amount.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Category</Label>
                            {selectedCategory && SelectedIcon && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                                        <SelectedIcon className="h-3 w-3" />
                                    </span>
                                    {selectedCategory.name}
                                </span>
                            )}
                        </div>

                        {categoriesLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                                No categories available.
                            </div>
                        ) : (
                            <div
                                role="radiogroup"
                                aria-label="Category"
                                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                            >
                                {categories.map((category) => {
                                    const Icon = getIcon(category.categoryIcon || 'CreditCard');
                                    const isSelected = selectedCategoryId === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            disabled={loading}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                            className={cn(
                                                'group flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all',
                                                'hover:border-primary/50 hover:bg-muted/50',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                                isSelected
                                                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                                                    : 'border-border bg-background text-foreground/80',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="truncate w-full text-center">
                                                {category.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || !selectedCategoryId || categoriesLoading}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Saving…' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};