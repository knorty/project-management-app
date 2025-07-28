'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function TestDialog() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Test Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Test Dialog</DialogTitle>
                    <DialogDescription>
                        This is a test dialog to check if the dialog component is working.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>If you can see this, the dialog is working!</p>
                    <Button onClick={() => setIsOpen(false)} className="mt-4">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 