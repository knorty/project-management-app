import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const emailThreads = await prisma.emailThread.findMany({
            include: {
                messages: {
                    orderBy: {
                        timestamp: 'asc'
                    },
                    take: 1 // Get the first message for preview
                },
                participants: {
                    include: {
                        user: true
                    }
                },
                tags: true,
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return NextResponse.json(emailThreads)
    } catch (error) {
        console.error('Error fetching email threads:', error)
        return NextResponse.json(
            { error: 'Failed to fetch email threads' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { subject, threadId, participants, tags } = body

        const emailThread = await prisma.emailThread.create({
            data: {
                subject,
                threadId,
                participants: {
                    create: participants?.map((p: any) => ({
                        email: p.email,
                        name: p.name,
                        role: p.role
                    })) || []
                },
                tags: {
                    create: tags?.map((t: any) => ({
                        name: t.name,
                        color: t.color
                    })) || []
                }
            },
            include: {
                participants: {
                    include: {
                        user: true
                    }
                },
                tags: true
            }
        })

        return NextResponse.json(emailThread, { status: 201 })
    } catch (error) {
        console.error('Error creating email thread:', error)
        return NextResponse.json(
            { error: 'Failed to create email thread' },
            { status: 500 }
        )
    }
} 