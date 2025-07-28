import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Mail, Reply, Forward, Calendar, User, Users } from 'lucide-react'

interface TimelineEvent {
    id: string
    eventType: string
    title: string
    description: string
    timestamp: string
    order: number
    metadata: any
    message?: {
        id: string
        subject: string
        from: string
        timestamp: string
        body: string
        textBody: string
    }
}

interface TimelineViewProps {
    timeline: {
        id: string
        title: string
        description: string
        isPublic: boolean
        createdAt: string
        updatedAt: string
        thread: {
            id: string
            subject: string
            participants: Array<{
                id: string
                email: string
                name: string
                role: string
                user?: {
                    id: string
                    email: string
                    name: string
                }
            }>
            tags: Array<{
                id: string
                name: string
                color: string
            }>
        }
        events: TimelineEvent[]
    }
}

export function TimelineView({ timeline }: TimelineViewProps) {
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

    const toggleEvent = (eventId: string) => {
        const newExpanded = new Set(expandedEvents)
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId)
        } else {
            newExpanded.add(eventId)
        }
        setExpandedEvents(newExpanded)
    }

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'EMAIL_RECEIVED':
                return <Mail className="w-4 h-4" />
            case 'EMAIL_REPLIED':
                return <Reply className="w-4 h-4" />
            case 'EMAIL_FORWARDED':
                return <Forward className="w-4 h-4" />
            default:
                return <Mail className="w-4 h-4" />
        }
    }

    const getEventColor = (eventType: string) => {
        switch (eventType) {
            case 'EMAIL_RECEIVED':
                return 'bg-blue-500'
            case 'EMAIL_REPLIED':
                return 'bg-green-500'
            case 'EMAIL_FORWARDED':
                return 'bg-yellow-500'
            default:
                return 'bg-gray-500'
        }
    }

    const formatEmailBody = (body: string) => {
        // Simple HTML sanitization and formatting
        return body
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim()
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleString()
        }
    }

    return (
        <div className="space-y-6">
            {/* Timeline Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl">{timeline.title}</CardTitle>
                            <p className="text-muted-foreground">{timeline.description}</p>

                            {/* Thread Info */}
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{timeline.thread.subject}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{timeline.thread.participants.length} participants</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatTimestamp(timeline.createdAt).date}</span>
                                </div>
                            </div>
                        </div>

                        <Badge variant={timeline.isPublic ? "default" : "secondary"}>
                            {timeline.isPublic ? "Public" : "Private"}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Participants */}
                    <div className="space-y-3">
                        <h4 className="font-medium flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Participants</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {timeline.thread.participants.map((participant) => (
                                <div key={participant.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>
                                            {(participant.user?.name || participant.name || participant.email)
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {participant.user?.name || participant.name || participant.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {participant.email}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {participant.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {timeline.thread.tags.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {timeline.thread.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        style={{ backgroundColor: tag.color }}
                                        className="text-white"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Timeline Events */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Timeline Events ({timeline.events.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {timeline.events.map((event, index) => {
                            const isExpanded = expandedEvents.has(event.id)
                            const timestamp = formatTimestamp(event.timestamp)

                            return (
                                <div key={event.id} className="relative">
                                    {/* Timeline Line */}
                                    {index < timeline.events.length - 1 && (
                                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                                    )}

                                    <div className="flex space-x-4">
                                        {/* Event Icon */}
                                        <div className={`w-12 h-12 rounded-full ${getEventColor(event.eventType)} flex items-center justify-center text-white flex-shrink-0`}>
                                            {getEventIcon(event.eventType)}
                                        </div>

                                        {/* Event Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                        <span>{timestamp.date}</span>
                                                        <span>{timestamp.time}</span>
                                                        {event.message?.from && (
                                                            <span>From: {event.message.from}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleEvent(event.id)}
                                                    className="flex items-center space-x-1"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" />
                                                            <span>Collapse</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" />
                                                            <span>Expand</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Expanded Email Content */}
                                            {isExpanded && event.message && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Subject: {event.message.subject}</h4>
                                                        <div className="text-sm text-muted-foreground">
                                                            <p><strong>From:</strong> {event.message.from}</p>
                                                            <p><strong>Time:</strong> {formatTimestamp(event.message.timestamp).full}</p>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    {/* Email Body */}
                                                    <div className="space-y-2">
                                                        <h5 className="font-medium text-sm">Message Content:</h5>
                                                        <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                                                            {event.message.body ? formatEmailBody(event.message.body) : event.message.textBody || 'No content available'}
                                                        </div>
                                                    </div>

                                                    {/* Metadata */}
                                                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <h5 className="font-medium text-sm">Details:</h5>
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    {Object.entries(event.metadata).map(([key, value]) => (
                                                                        <div key={key} className="flex justify-between">
                                                                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                                            <span className="text-muted-foreground">{String(value)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 