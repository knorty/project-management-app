import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const emailThread = await prisma.emailThread.findUnique({
            where: { id: params.id },
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
                tags: true,
                timelineView: {
                    include: {
                        events: {
                            orderBy: {
                                order: 'asc'
                            }
                        }
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

        return NextResponse.json(emailThread)
    } catch (error) {
        console.error('Error fetching email thread:', error)
        return NextResponse.json(
            { error: 'Failed to fetch email thread' },
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
        const { subject, tags } = body

        const emailThread = await prisma.emailThread.update({
            where: { id: params.id },
            data: {
                subject,
                tags: {
                    deleteMany: {},
                    create: tags?.map((t: any) => ({
                        name: t.name,
                        color: t.color
                    })) || []
                }
            },
            include: {
                participants: true,
                tags: true
            }
        })

        return NextResponse.json(emailThread)
    } catch (error) {
        console.error('Error updating email thread:', error)
        return NextResponse.json(
            { error: 'Failed to update email thread' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.emailThread.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Email thread deleted successfully' })
    } catch (error) {
        console.error('Error deleting email thread:', error)
        return NextResponse.json(
            { error: 'Failed to delete email thread' },
            { status: 500 }
        )
    }
} 