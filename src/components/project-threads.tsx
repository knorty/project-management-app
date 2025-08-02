'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Pin, MessageSquare, Plus, Tag } from "lucide-react"

interface Thread {
    id: string
    title: string
    description: string
    isPinned: boolean
    createdAt: string
    updatedAt: string
    creator: {
        id: string
        name: string
        email: string
        image: string
    }
    messages: Array<{
        id: string
        content: string
        createdAt: string
        user: {
            id: string
            name: string
            email: string
            image: string
        }
    }>
    tags: Array<{
        id: string
        name: string
        color: string
    }>
    _count: {
        messages: number
    }
}

interface ProjectThreadsProps {
    projectId: string
}

export function ProjectThreads({ projectId }: ProjectThreadsProps) {
    const [threads, setThreads] = useState<Thread[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newThread, setNewThread] = useState({
        title: '',
        description: '',
        tags: [] as string[]
    })

    useEffect(() => {
        fetchThreads()
    }, [projectId])

    const fetchThreads = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/projects/${projectId}/threads`)
            if (!response.ok) {
                throw new Error('Failed to fetch threads')
            }
            const data = await response.json()
            setThreads(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateThread = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newThread),
            })

            if (!response.ok) {
                throw new Error('Failed to create thread')
            }

            const createdThread = await response.json()
            setThreads([createdThread, ...threads])
            setNewThread({ title: '', description: '', tags: [] })
            setIsCreateDialogOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create thread')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Loading threads...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Project Threads</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Thread
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Thread</DialogTitle>
                            <DialogDescription>
                                Start a new discussion thread for this project.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    placeholder="Thread title"
                                    value={newThread.title}
                                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Thread description (optional)"
                                    value={newThread.description}
                                    onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateThread} disabled={!newThread.title.trim()}>
                                    Create Thread
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {threads.length === 0 ? (
                <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No threads yet. Create the first thread to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            {thread.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                                            <CardTitle className="text-lg">{thread.title}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            {thread.description}
                                        </CardDescription>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <span>{thread._count.messages} messages</span>
                                            <span>•</span>
                                            <span>{formatDate(thread.updatedAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={thread.creator.image} />
                                            <AvatarFallback>
                                                {getInitials(thread.creator.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Creator info */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">Created by:</span>
                                        <span className="text-sm text-muted-foreground">{thread.creator.name}</span>
                                    </div>

                                    {/* Tags */}
                                    {thread.tags.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <Tag className="w-4 h-4 text-muted-foreground" />
                                            <div className="flex flex-wrap gap-1">
                                                {thread.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        style={{ backgroundColor: tag.color }}
                                                        className="text-white text-xs"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Latest message preview */}
                                    {thread.messages.length > 0 && (
                                        <div className="border-t pt-3">
                                            <div className="flex items-start space-x-3">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={thread.messages[0].user.image} />
                                                    <AvatarFallback>
                                                        {getInitials(thread.messages[0].user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium">
                                                            {thread.messages[0].user.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(thread.messages[0].createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {thread.messages[0].content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 