'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UiTransaction } from '@/Interfaces/Interfaces';
import { useState } from 'react';

interface ConfirmDeleteTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: UiTransaction | null;
    onConfirm: (transactionId: string) => void;
}

export const ConfirmDeleteTransactionModal = ({
    isOpen,
    onClose,
    transaction,
    onConfirm,
}: ConfirmDeleteTransactionModalProps) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (transaction) {
            setLoading(true);
            try {
                await onConfirm(transaction.id.toString());
                onClose();
            } finally {
                setLoading(false);
            }
        }
    };

    if (!transaction) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the transaction:
                        <br />
                        <strong>{transaction.name}</strong> for <strong>KES {transaction.amount.toFixed(2)}</strong> on <strong>{transaction.date}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
