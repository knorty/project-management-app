'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface EmailImportProps {
    onImportSuccess?: (result: any) => void
    onImportError?: (error: string) => void
}

export function EmailImport({ onImportSuccess, onImportError }: EmailImportProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('forwarded')
    const [importData, setImportData] = useState({
        forwarded: {
            subject: '',
            from: '',
            to: '',
            cc: '',
            bcc: '',
            body: '',
            textBody: ''
        },
        manual: {
            subject: '',
            messages: [{ from: '', to: '', subject: '', body: '', timestamp: new Date().toISOString() }]
        },
        file: {
            emlContent: '',
            subject: '',
            from: '',
            to: ''
        }
    })

    const handleImport = async (source: string) => {
        setIsLoading(true)
        try {
            // Validate required fields
            if (source === 'manual') {
                if (!importData.manual.subject.trim()) {
                    throw new Error('Thread subject is required')
                }
                if (importData.manual.messages.length === 0) {
                    throw new Error('At least one message is required')
                }
                for (let i = 0; i < importData.manual.messages.length; i++) {
                    const msg = importData.manual.messages[i]
                    if (!msg.from.trim()) {
                        throw new Error(`Message ${i + 1}: From field is required`)
                    }
                    if (!msg.to.trim()) {
                        throw new Error(`Message ${i + 1}: To field is required`)
                    }
                    if (!msg.subject.trim()) {
                        throw new Error(`Message ${i + 1}: Subject field is required`)
                    }
                    if (!msg.body.trim()) {
                        throw new Error(`Message ${i + 1}: Body field is required`)
                    }
                }
            }
            let data: any
            let options = { autoGenerateTimeline: true }

            switch (source) {
                case 'forwarded':
                    data = {
                        subject: importData.forwarded.subject,
                        from: importData.forwarded.from,
                        to: importData.forwarded.to.split(',').map((email: string) => email.trim()),
                        cc: importData.forwarded.cc ? importData.forwarded.cc.split(',').map((email: string) => email.trim()) : [],
                        bcc: importData.forwarded.bcc ? importData.forwarded.bcc.split(',').map((email: string) => email.trim()) : [],
                        body: importData.forwarded.body,
                        textBody: importData.forwarded.textBody,
                        timestamp: new Date().toISOString()
                    }
                    break
                case 'manual':
                    console.log('🔍 Manual entry data before processing:', importData.manual)
                    data = {
                        subject: importData.manual.subject,
                        messages: importData.manual.messages.map((msg, index) => {
                            const processedMsg = {
                                ...msg,
                                messageId: `manual_msg_${Date.now()}_${index}`,
                                to: msg.to.split(',').map((email: string) => email.trim()),
                                cc: (msg as any).cc ? (msg as any).cc.split(',').map((email: string) => email.trim()) : [],
                                bcc: (msg as any).bcc ? (msg as any).bcc.split(',').map((email: string) => email.trim()) : []
                            }
                            console.log('🔍 Processed message:', processedMsg)
                            return processedMsg
                        })
                    }
                    console.log('🔍 Final manual entry data:', data)
                    break
                case 'file':
                    data = {
                        emlContent: importData.file.emlContent,
                        subject: importData.file.subject,
                        from: importData.file.from,
                        to: importData.file.to.split(',').map((email: string) => email.trim())
                    }
                    break
                default:
                    throw new Error('Invalid import source')
            }

            console.log('🔍 Sending request with data:', { source, data, options })

            const response = await fetch('/api/email-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, data, options })
            })

            console.log('🔍 Response status:', response.status)

            const result = await response.json()
            console.log('🔍 Response result:', result)

            if (!response.ok) {
                throw new Error(result.error || 'Import failed')
            }

            onImportSuccess?.(result)
            setIsOpen(false)
            resetForm()
        } catch (error) {
            console.error('🔍 Import error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Import failed'
            onImportError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setImportData({
            forwarded: {
                subject: '',
                from: '',
                to: '',
                cc: '',
                bcc: '',
                body: '',
                textBody: ''
            },
            manual: {
                subject: '',
                messages: [{ from: '', to: '', cc: '', bcc: '', subject: '', body: '', timestamp: new Date().toISOString() }]
            },
            file: {
                emlContent: '',
                subject: '',
                from: '',
                to: ''
            }
        })
    }

    const addMessage = () => {
        setImportData(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                messages: [...prev.manual.messages, { from: '', to: '', cc: '', bcc: '', subject: '', body: '', timestamp: new Date().toISOString() }]
            }
        }))
    }

    const removeMessage = (index: number) => {
        if (importData.manual.messages.length > 1) {
            setImportData(prev => ({
                ...prev,
                manual: {
                    ...prev.manual,
                    messages: prev.manual.messages.filter((_, i) => i !== index)
                }
            }))
        }
    }

    const updateMessage = (index: number, field: string, value: string) => {
        setImportData(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                messages: prev.manual.messages.map((msg, i) =>
                    i === index ? { ...msg, [field]: value } : msg
                )
            }
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Import Email Thread</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Email Thread</DialogTitle>
                    <DialogDescription>
                        Import email threads from various sources to create timelines
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="forwarded">Forwarded Email</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        <TabsTrigger value="file">Email File</TabsTrigger>
                    </TabsList>

                    <TabsContent value="forwarded" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Forwarded Email</CardTitle>
                                <CardDescription>
                                    Import a forwarded email by filling in the details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            value={importData.forwarded.subject}
                                            onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, subject: e.target.value } }))}
                                            placeholder="Email subject"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">From</label>
                                        <Input
                                            value={importData.forwarded.from}
                                            onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, from: e.target.value } }))}
                                            placeholder="sender@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">To</label>
                                        <Input
                                            value={importData.forwarded.to}
                                            onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, to: e.target.value } }))}
                                            placeholder="recipient@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">CC</label>
                                        <Input
                                            value={importData.forwarded.cc}
                                            onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, cc: e.target.value } }))}
                                            placeholder="cc@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">BCC</label>
                                        <Input
                                            value={importData.forwarded.bcc}
                                            onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, bcc: e.target.value } }))}
                                            placeholder="bcc@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Email Body (HTML)</label>
                                    <Textarea
                                        value={importData.forwarded.body}
                                        onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, body: e.target.value } }))}
                                        placeholder="<p>Email content...</p>"
                                        rows={6}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Email Body (Plain Text)</label>
                                    <Textarea
                                        value={importData.forwarded.textBody}
                                        onChange={(e) => setImportData(prev => ({ ...prev, forwarded: { ...prev.forwarded, textBody: e.target.value } }))}
                                        placeholder="Plain text version of the email"
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    onClick={() => handleImport('forwarded')}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Importing...' : 'Import Forwarded Email'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manual Email Entry</CardTitle>
                                <CardDescription>
                                    Manually enter email thread details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Thread Subject</label>
                                    <Input
                                        value={importData.manual.subject}
                                        onChange={(e) => setImportData(prev => ({ ...prev, manual: { ...prev.manual, subject: e.target.value } }))}
                                        placeholder="Thread subject"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Messages</h4>
                                        <Button variant="outline" size="sm" onClick={addMessage}>
                                            Add Message
                                        </Button>
                                    </div>

                                    {importData.manual.messages.map((message, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="secondary">Message {index + 1}</Badge>
                                                {importData.manual.messages.length > 1 && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeMessage(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="text-sm font-medium">From</label>
                                                    <Input
                                                        value={message.from}
                                                        onChange={(e) => updateMessage(index, 'from', e.target.value)}
                                                        placeholder="sender@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">To</label>
                                                    <Input
                                                        value={message.to}
                                                        onChange={(e) => updateMessage(index, 'to', e.target.value)}
                                                        placeholder="recipient@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="text-sm font-medium">CC</label>
                                                    <Input
                                                        value={(message as any).cc || ''}
                                                        onChange={(e) => updateMessage(index, 'cc', e.target.value)}
                                                        placeholder="cc@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">BCC</label>
                                                    <Input
                                                        value={(message as any).bcc || ''}
                                                        onChange={(e) => updateMessage(index, 'bcc', e.target.value)}
                                                        placeholder="bcc@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="text-sm font-medium">Subject</label>
                                                <Input
                                                    value={message.subject}
                                                    onChange={(e) => updateMessage(index, 'subject', e.target.value)}
                                                    placeholder="Message subject"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium">Body</label>
                                                <Textarea
                                                    value={message.body}
                                                    onChange={(e) => updateMessage(index, 'body', e.target.value)}
                                                    placeholder="Message content"
                                                    rows={4}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleImport('manual')}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Importing...' : 'Import Manual Entry'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email File Import</CardTitle>
                                <CardDescription>
                                    Import from EML or MSG files
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Email Content (EML/MSG)</label>
                                    <Textarea
                                        value={importData.file.emlContent}
                                        onChange={(e) => setImportData(prev => ({ ...prev, file: { ...prev.file, emlContent: e.target.value } }))}
                                        placeholder="Paste EML content here..."
                                        rows={8}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input
                                            value={importData.file.subject}
                                            onChange={(e) => setImportData(prev => ({ ...prev, file: { ...prev.file, subject: e.target.value } }))}
                                            placeholder="Email subject"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">From</label>
                                        <Input
                                            value={importData.file.from}
                                            onChange={(e) => setImportData(prev => ({ ...prev, file: { ...prev.file, from: e.target.value } }))}
                                            placeholder="sender@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">To</label>
                                    <Input
                                        value={importData.file.to}
                                        onChange={(e) => setImportData(prev => ({ ...prev, file: { ...prev.file, to: e.target.value } }))}
                                        placeholder="recipient@example.com"
                                    />
                                </div>

                                <Button
                                    onClick={() => handleImport('file')}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Importing...' : 'Import Email File'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 