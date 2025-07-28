import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const events = await prisma.timelineEvent.findMany({
            where: { timelineId: params.id },
            orderBy: { order: 'asc' },
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
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching timeline events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch timeline events' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { messageId, eventType, title, description, timestamp, order, metadata } = body

        // Verify the timeline exists
        const timeline = await prisma.timelineView.findUnique({
            where: { id: params.id }
        })

        if (!timeline) {
            return NextResponse.json(
                { error: 'Timeline not found' },
                { status: 404 }
            )
        }

        // Get the next order number if not provided
        let eventOrder = order
        if (!eventOrder) {
            const lastEvent = await prisma.timelineEvent.findFirst({
                where: { timelineId: params.id },
                orderBy: { order: 'desc' }
            })
            eventOrder = (lastEvent?.order || 0) + 1
        }

        const event = await prisma.timelineEvent.create({
            data: {
                timelineId: params.id,
                messageId,
                eventType: eventType as EventType,
                title,
                description,
                timestamp: timestamp || new Date(),
                order: eventOrder,
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

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error('Error creating timeline event:', error)
        return NextResponse.json(
            { error: 'Failed to create timeline event' },
            { status: 500 }
        )
    }
} 