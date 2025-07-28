import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const timeline = await prisma.timelineView.findUnique({
            where: { id: params.id },
            include: {
                thread: {
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
                                timestamp: true,
                                body: true,
                                textBody: true
                            }
                        }
                    }
                }
            }
        })

        if (!timeline) {
            return NextResponse.json(
                { error: 'Timeline not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(timeline)
    } catch (error) {
        console.error('Error fetching timeline:', error)
        return NextResponse.json(
            { error: 'Failed to fetch timeline' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { title, description, isPublic, events } = body

        // Update the timeline
        const timeline = await prisma.timelineView.update({
            where: { id: params.id },
            data: {
                title,
                description,
                isPublic,
                events: {
                    deleteMany: {},
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

        return NextResponse.json(timeline)
    } catch (error) {
        console.error('Error updating timeline:', error)
        return NextResponse.json(
            { error: 'Failed to update timeline' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.timelineView.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Timeline deleted successfully' })
    } catch (error) {
        console.error('Error deleting timeline:', error)
        return NextResponse.json(
            { error: 'Failed to delete timeline' },
            { status: 500 }
        )
    }
} 