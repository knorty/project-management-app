import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const timelines = await prisma.timelineView.findMany({
            include: {
                thread: {
                    include: {
                        participants: true,
                        tags: true,
                        _count: {
                            select: {
                                messages: true
                            }
                        }
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
                },
                _count: {
                    select: {
                        events: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return NextResponse.json(timelines)
    } catch (error) {
        console.error('Error fetching timelines:', error)
        return NextResponse.json(
            { error: 'Failed to fetch timelines' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { threadId, title, description, isPublic = false, events } = body

        // Verify the email thread exists
        const emailThread = await prisma.emailThread.findUnique({
            where: { id: threadId },
            include: {
                messages: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        })

        if (!emailThread) {
            return NextResponse.json(
                { error: 'Email thread not found' },
                { status: 404 }
            )
        }

        // Create the timeline view
        const timeline = await prisma.timelineView.create({
            data: {
                threadId,
                title,
                description,
                isPublic,
                events: {
                    create: events?.map((event: any, index: number) => ({
                        messageId: event.messageId,
                        eventType: event.eventType,
                        title: event.title,
                        description: event.description,
                        timestamp: event.timestamp || new Date(),
                        order: event.order || index + 1,
                        metadata: event.metadata
                    })) || []
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
                    }
                }
            }
        })

        return NextResponse.json(timeline, { status: 201 })
    } catch (error) {
        console.error('Error creating timeline:', error)
        return NextResponse.json(
            { error: 'Failed to create timeline' },
            { status: 500 }
        )
    }
} 