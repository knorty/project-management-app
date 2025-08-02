import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
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
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        threads: true
                    }
                }
            }
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await request.json()

        const {
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            budget,
            client
        } = body

        // Validate required fields
        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            )
        }

        // Update the project
        const updatedProject = await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                status: status || 'ACTIVE',
                priority: priority || 'MEDIUM',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget: budget ? parseFloat(budget) : null,
                client: client?.trim() || null,
                updatedAt: new Date()
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
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        tasks: true,
                        threads: true
                    }
                }
            }
        })

        return NextResponse.json(updatedProject)
    } catch (error) {
        console.error('Error updating project:', error)

        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
} 