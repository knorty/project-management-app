import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; threadId: string }> }
) {
    try {
        const { threadId } = await params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const messages = await prisma.threadMessage.findMany({
            where: {
                threadId: threadId,
                parentId: null // Only get top-level messages
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        },
                        attachments: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                attachments: true
            },
            orderBy: {
                createdAt: 'asc'
            },
            skip: skip,
            take: limit
        })

        const total = await prisma.threadMessage.count({
            where: {
                threadId: threadId,
                parentId: null
            }
        })

        return NextResponse.json({
            messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching thread messages:', error)
        return NextResponse.json(
            { error: 'Failed to fetch thread messages' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; threadId: string }> }
) {
    try {
        const { threadId } = await params
        const body = await request.json()
        const { content, parentId } = body

        // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
        const userId = 'clx1234567890abcdef' // This should be the authenticated user's ID

        const message = await prisma.threadMessage.create({
            data: {
                threadId: threadId,
                content: content,
                userId: userId,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                attachments: true
            }
        })

        // Update the thread's updatedAt timestamp
        await prisma.projectThread.update({
            where: {
                id: threadId
            },
            data: {
                updatedAt: new Date()
            }
        })

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        console.error('Error creating thread message:', error)
        return NextResponse.json(
            { error: 'Failed to create thread message' },
            { status: 500 }
        )
    }
} 