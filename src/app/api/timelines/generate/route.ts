import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { threadId, title, description, isPublic = false } = body

        // Get the email thread with all messages
        const emailThread = await prisma.emailThread.findUnique({
            where: { id: threadId },
            include: {
                messages: {
                    orderBy: {
                        timestamp: 'asc'
                    },
                    include: {
                        attachments: true,
                        replies: {
                            include: {
                                attachments: true
                            }
                        }
                    }
                },
                participants: true,
                tags: true
            }
        })

        if (!emailThread) {
            return NextResponse.json(
                { error: 'Email thread not found' },
                { status: 404 }
            )
        }

        // Check if timeline already exists for this thread
        const existingTimeline = await prisma.timelineView.findUnique({
            where: { threadId }
        })

        if (existingTimeline) {
            return NextResponse.json(
                { error: 'Timeline already exists for this thread' },
                { status: 409 }
            )
        }

        // Generate timeline events from messages
        const timelineEvents = emailThread.messages.map((message, index) => {
            let eventType: EventType = EventType.EMAIL_RECEIVED
            let eventTitle = 'Email Received'
            let eventDescription = `Email from ${message.from}`

            // Determine event type based on message properties
            if (message.isReplied) {
                eventType = EventType.EMAIL_REPLIED
                eventTitle = 'Email Reply'
                eventDescription = `Reply from ${message.from}`
            } else if (message.isForwarded) {
                eventType = EventType.EMAIL_FORWARDED
                eventTitle = 'Email Forwarded'
                eventDescription = `Forwarded by ${message.from}`
            }

            // Check for attachments
            if (message.attachments.length > 0) {
                eventDescription += ` (${message.attachments.length} attachment${message.attachments.length > 1 ? 's' : ''})`
            }

            // Check for replies
            if (message.replies.length > 0) {
                eventDescription += ` (${message.replies.length} reply${message.replies.length > 1 ? 'ies' : 'y'})`
            }

            return {
                messageId: message.id,
                eventType,
                title: eventTitle,
                description: eventDescription,
                timestamp: message.timestamp,
                order: index + 1,
                metadata: {
                    sender: message.from,
                    recipients: [...message.to, ...message.cc],
                    hasAttachments: message.attachments.length > 0,
                    attachmentCount: message.attachments.length,
                    replyCount: message.replies.length,
                    isRead: message.isRead
                }
            }
        })

        // Create the timeline view with generated events
        const timeline = await prisma.timelineView.create({
            data: {
                threadId,
                title: title || `${emailThread.subject} Timeline`,
                description: description || `Automatically generated timeline for ${emailThread.subject}`,
                isPublic,
                events: {
                    create: timelineEvents
                }
            },
            include: {
                thread: {
                    include: {
                        participants: true,
                        tags: true
                    }
                },
                events: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        message: {
                            select: {
                                id: true,
                                subject: true,
                                from: true,
                                timestamp: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Timeline generated successfully',
            timeline,
            generatedEvents: timelineEvents.length
        }, { status: 201 })
    } catch (error) {
        console.error('Error generating timeline:', error)
        return NextResponse.json(
            { error: 'Failed to generate timeline' },
            { status: 500 }
        )
    }
} 