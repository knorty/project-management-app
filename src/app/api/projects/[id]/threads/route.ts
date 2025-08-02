import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const threads = await prisma.projectThread.findMany({
            where: {
                projectId: projectId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                messages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1 // Get the latest message
                },
                tags: true,
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ]
        })

        return NextResponse.json(threads)
    } catch (error) {
        console.error('Error fetching project threads:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project threads' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await request.json()
        const { title, description, tags } = body

        // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
        const userId = 'clx1234567890abcdef' // This should be the authenticated user's ID

        const thread = await prisma.projectThread.create({
            data: {
                projectId: projectId,
                title: title,
                description: description,
                createdBy: userId,
                tags: tags ? {
                    create: tags.map((tag: string) => ({
                        name: tag,
                        color: `#${Math.floor(Math.random() * 16777215).toString(16)}` // Random color
                    }))
                } : undefined
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                tags: true
            }
        })

        return NextResponse.json(thread, { status: 201 })
    } catch (error) {
        console.error('Error creating project thread:', error)
        return NextResponse.json(
            { error: 'Failed to create project thread' },
            { status: 500 }
        )
    }
} 