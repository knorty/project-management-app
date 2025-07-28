'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface SimpleEmailImportProps {
    onImportSuccess?: (result: any) => void
    onImportError?: (error: string) => void
}

export function SimpleEmailImport({ onImportSuccess, onImportError }: SimpleEmailImportProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        subject: '',
        from: '',
        to: '',
        body: ''
    })

    const handleImport = async () => {
        setIsLoading(true)
        try {
            const data = {
                subject: formData.subject,
                from: formData.from,
                to: formData.to.split(',').map((email: string) => email.trim()),
                body: formData.body,
                timestamp: new Date().toISOString()
            }

            const response = await fetch('/api/email-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'forwarded_email',
                    data,
                    options: { autoGenerateTimeline: true }
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Import failed')
            }

            onImportSuccess?.(result)
            setIsOpen(false)
            setFormData({ subject: '', from: '', to: '', body: '' })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Import failed'
            onImportError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Simple Import</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Email</DialogTitle>
                    <DialogDescription>
                        Import a simple email thread
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Email subject"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">From</label>
                        <Input
                            value={formData.from}
                            onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                            placeholder="sender@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">To</label>
                        <Input
                            value={formData.to}
                            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                            placeholder="recipient@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Body</label>
                        <Textarea
                            value={formData.body}
                            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="Email content"
                            rows={4}
                        />
                    </div>

                    <Button
                        onClick={handleImport}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Importing...' : 'Import Email'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 