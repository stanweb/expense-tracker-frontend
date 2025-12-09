'use client'

import React, { useState, useRef } from 'react'
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
import {Input} from "@/components/ui/input";

interface BulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onTextSubmit: (rawMessage: string) => void
    onFileSubmit: (file: File) => void
    isLoading?: boolean
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
    isOpen,
    onClose,
    onTextSubmit,
    onFileSubmit,
    isLoading = false,
}) => {
    const [rawMessage, setRawMessage] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleTextSubmit = () => {
        if (rawMessage.trim()) {
            onTextSubmit(rawMessage)
            setRawMessage('')
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            onFileSubmit(file)
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setRawMessage('')
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[40vw]">
                <DialogHeader>
                    <DialogTitle>Upload Bulk Transactions</DialogTitle>
                    <DialogDescription>
                        Paste raw transaction messages or upload a PDF file.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="raw-message-bulk" className="text-sm font-medium">
                            Paste Transactions
                        </label>
                        <Textarea
                            id="raw-message-bulk"
                            placeholder="Paste the raw transaction messages here..."
                            value={rawMessage}
                            onChange={(e) => setRawMessage(e.target.value)}
                            rows={10}
                            className="resize-none overflow-y-auto"
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">OR</span>
                    </div>
                    <Button variant="outline" onClick={handleUploadClick}>
                        Upload PDF
                    </Button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/pdf"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTextSubmit}
                        disabled={!rawMessage.trim() || isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Process Text'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
