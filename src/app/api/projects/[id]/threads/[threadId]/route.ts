import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; threadId: string }> }
) {
    try {
        const { threadId } = await params

        const thread = await prisma.projectThread.findUnique({
            where: {
                id: threadId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                messages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true
                            }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true
                                    }
                                }
                            }
                        },
                        attachments: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                tags: true
            }
        })

        if (!thread) {
            return NextResponse.json(
                { error: 'Thread not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(thread)
    } catch (error) {
        console.error('Error fetching thread:', error)
        return NextResponse.json(
            { error: 'Failed to fetch thread' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; threadId: string }> }
) {
    try {
        const { threadId } = await params
        const body = await request.json()
        const { title, description, isPinned } = body

        const thread = await prisma.projectThread.update({
            where: {
                id: threadId
            },
            data: {
                title: title,
                description: description,
                isPinned: isPinned
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                tags: true
            }
        })

        return NextResponse.json(thread)
    } catch (error) {
        console.error('Error updating thread:', error)
        return NextResponse.json(
            { error: 'Failed to update thread' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; threadId: string }> }
) {
    try {
        const { threadId } = await params

        await prisma.projectThread.delete({
            where: {
                id: threadId
            }
        })

        return NextResponse.json({ message: 'Thread deleted successfully' })
    } catch (error) {
        console.error('Error deleting thread:', error)
        return NextResponse.json(
            { error: 'Failed to delete thread' },
            { status: 500 }
        )
    }
} 