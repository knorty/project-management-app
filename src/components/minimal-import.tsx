'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function MinimalImport() {
    const [isOpen, setIsOpen] = useState(false)

    const handleImport = async () => {
        try {
            const response = await fetch('/api/email-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'forwarded_email',
                    data: {
                        subject: 'Minimal Test',
                        from: 'test@example.com',
                        to: 'test@example.com',
                        body: 'This is a minimal test'
                    },
                    options: { autoGenerateTimeline: true }
                })
            })

            const result = await response.json()
            console.log('Import result:', result)

            if (response.ok) {
                alert('Import successful!')
                setIsOpen(false)
            } else {
                alert('Import failed: ' + result.error)
            }
        } catch (error) {
            console.error('Import error:', error)
            alert('Import failed: ' + error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Minimal Import</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Minimal Import Test</DialogTitle>
                    <DialogDescription>
                        This is a minimal test to see if the dialog works
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p>If you can see this dialog, the dialog component is working!</p>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleImport}>
                            Test Import
                        </Button>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 