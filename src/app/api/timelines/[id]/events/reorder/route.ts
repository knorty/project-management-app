import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { eventIds } = body // Array of event IDs in the new order

        if (!Array.isArray(eventIds) || eventIds.length === 0) {
            return NextResponse.json(
                { error: 'eventIds must be a non-empty array' },
                { status: 400 }
            )
        }

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

        // Update the order of events
        const updatePromises = eventIds.map((eventId: string, index: number) => {
            return prisma.timelineEvent.update({
                where: { id: eventId },
                data: { order: index + 1 }
            })
        })

        await Promise.all(updatePromises)

        // Fetch the updated events
        const updatedEvents = await prisma.timelineEvent.findMany({
            where: { timelineId: params.id },
            orderBy: { order: 'asc' },
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

        return NextResponse.json({
            success: true,
            message: 'Events reordered successfully',
            events: updatedEvents
        })
    } catch (error) {
        console.error('Error reordering timeline events:', error)
        return NextResponse.json(
            { error: 'Failed to reorder timeline events' },
            { status: 500 }
        )
    }
} 