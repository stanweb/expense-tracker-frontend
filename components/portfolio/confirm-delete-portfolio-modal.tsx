'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDeletePortfolioModalProps {
    isOpen: boolean
    onClose: () => void
    portfolioName: string
    loading?: boolean
    onConfirm: () => void
}

export function ConfirmDeletePortfolioModal({
    isOpen,
    onClose,
    portfolioName,
    loading,
    onConfirm,
}: ConfirmDeletePortfolioModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete portfolio?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove <strong>{portfolioName}</strong> and all of its
                        associated investment transactions. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}