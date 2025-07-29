'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Calendar, ArrowLeft, ArrowRight } from "lucide-react"

interface TimelineMessage {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        avatar: string
    }
    thread: {
        id: string
        title: string
        description: string
    }
    attachments: Array<{
        id: string
        filename: string
        fileType: string
        fileSize: number
    }>
    parent?: {
        id: string
        content: string
        user: {
            id: string
            name: string
            email: string
            avatar: string
        }
    }
}

interface TimelineDay {
    date: string
    messages: TimelineMessage[]
}

interface ProjectTimelineProps {
    projectId: string
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
    const [timeline, setTimeline] = useState<TimelineDay[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchTimeline()
    }, [projectId, currentPage])

    const fetchTimeline = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/projects/${projectId}/timeline?page=${currentPage}&limit=50`)
            if (!response.ok) {
                throw new Error('Failed to fetch timeline')
            }
            const data = await response.json()
            setTimeline(data.timeline)
            setTotalPages(data.pagination.pages)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Loading timeline...</p>
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
                <h2 className="text-2xl font-semibold">Project Timeline</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {timeline.length === 0 ? (
                <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No messages yet. Start a thread to see activity here!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {timeline.map((day) => (
                        <div key={day.date} className="space-y-4">
                            {/* Date Header */}
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">{formatDate(day.date)}</h3>
                                <Badge variant="outline">{day.messages.length} messages</Badge>
                            </div>

                            {/* Messages for this day */}
                            <div className="space-y-4 ml-8">
                                {day.messages.map((message) => (
                                    <Card key={message.id} className="border-l-4 border-l-blue-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={message.user.avatar} />
                                                        <AvatarFallback>
                                                            {getInitials(message.user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium">{message.user.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {message.thread.title}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatTime(message.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {/* Reply context */}
                                            {message.parent && (
                                                <div className="mb-3 p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage src={message.parent.user.avatar} />
                                                            <AvatarFallback>
                                                                {getInitials(message.parent.user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium">{message.parent.user.name}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{message.parent.content}</p>
                                                </div>
                                            )}

                                            {/* Message content */}
                                            <p className="text-sm leading-relaxed">{message.content}</p>

                                            {/* Attachments */}
                                            {message.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-sm font-medium mb-2">Attachments:</p>
                                                    <div className="space-y-1">
                                                        {message.attachments.map((attachment) => (
                                                            <div key={attachment.id} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                                <span>📎</span>
                                                                <span>{attachment.filename}</span>
                                                                <span>({formatFileSize(attachment.fileSize)})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 