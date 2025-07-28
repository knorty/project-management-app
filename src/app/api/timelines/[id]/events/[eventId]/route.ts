import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; eventId: string } }
) {
    try {
        const event = await prisma.timelineEvent.findUnique({
            where: { id: params.eventId },
            include: {
                message: {
                    select: {
                        id: true,
                        subject: true,
                        from: true,
                        timestamp: true,
                        body: true,
                        textBody: true,
                        attachments: true
                    }
                }
            }
        })

        if (!event) {
            return NextResponse.json(
                { error: 'Timeline event not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching timeline event:', error)
        return NextResponse.json(
            { error: 'Failed to fetch timeline event' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; eventId: string } }
) {
    try {
        const body = await request.json()
        const { eventType, title, description, timestamp, order, metadata } = body

        const event = await prisma.timelineEvent.update({
            where: { id: params.eventId },
            data: {
                eventType: eventType as EventType,
                title,
                description,
                timestamp: timestamp || new Date(),
                order,
                metadata
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
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating timeline event:', error)
        return NextResponse.json(
            { error: 'Failed to update timeline event' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; eventId: string } }
) {
    try {
        await prisma.timelineEvent.delete({
            where: { id: params.eventId }
        })

        return NextResponse.json({ message: 'Timeline event deleted successfully' })
    } catch (error) {
        console.error('Error deleting timeline event:', error)
        return NextResponse.json(
            { error: 'Failed to delete timeline event' },
            { status: 500 }
        )
    }
} 