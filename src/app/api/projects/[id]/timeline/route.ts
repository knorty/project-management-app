import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        // Get all messages from all threads in the project
        const messages = await prisma.threadMessage.findMany({
            where: {
                thread: {
                    projectId: projectId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                thread: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                attachments: true,
                parent: {
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit
        })

        const total = await prisma.threadMessage.count({
            where: {
                thread: {
                    projectId: projectId
                }
            }
        })

        // Group messages by date for timeline view
        const timelineData = messages.reduce((acc, message) => {
            const date = message.createdAt.toISOString().split('T')[0]
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(message)
            return acc
        }, {} as Record<string, typeof messages>)

        // Convert to array and sort by date
        const timeline = Object.entries(timelineData)
            .map(([date, messages]) => ({
                date,
                messages: messages.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json({
            timeline,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching project timeline:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project timeline' },
            { status: 500 }
        )
    }
} 