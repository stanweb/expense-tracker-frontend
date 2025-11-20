'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AddTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (rawMessage: string) => void
    isLoading?: boolean
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSubmit,
                                                                            isLoading = false,
                                                                        }) => {
    const [rawMessage, setRawMessage] = useState('')

    const handleSubmit = () => {
        if (rawMessage.trim()) {
            onSubmit(rawMessage)
            setRawMessage('')
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setRawMessage('')
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Enter the raw transaction message to parse and add a new transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="raw-message" className="text-sm font-medium">
                            Raw Message
                        </label>
                        <Textarea
                            id="raw-message"
                            placeholder="Paste the raw transaction message here..."
                            value={rawMessage}
                            onChange={(e) => setRawMessage(e.target.value)}
                            rows={6}
                            className="resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!rawMessage.trim() || isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Parse & Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
