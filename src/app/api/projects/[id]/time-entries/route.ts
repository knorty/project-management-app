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
        const isRunning = searchParams.get('isRunning')

        // Build where clause
        const whereClause: {
            projectId: string
            isRunning?: boolean
        } = {
            projectId: projectId
        }

        // Add isRunning filter if specified
        if (isRunning !== null) {
            whereClause.isRunning = isRunning === 'true'
        }

        // Get time entries for the project
        const timeEntries = await prisma.timeEntry.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                },
                task: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            },
            skip,
            take: limit
        })

        // Get total count for pagination
        const total = await prisma.timeEntry.count({
            where: whereClause
        })

        return NextResponse.json({
            timeEntries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching time entries:', error)
        return NextResponse.json(
            { error: 'Failed to fetch time entries' },
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

        console.log('=== TIME ENTRY CREATE DEBUG ===')
        console.log('Project ID:', projectId)
        console.log('Request body:', body)

        const {
            taskId,
            categoryId,
            description,
            startTime,
            endTime,
            duration,
            isRunning,
            billable,
            hourlyRate,
            notes,
            userId
        } = body

        console.log('Extracted userId:', userId)
        console.log('Extracted description:', description)
        console.log('Extracted startTime:', startTime)

        // Validate required fields
        if (!description || !startTime || !userId) {
            console.log('Validation failed:')
            console.log('- description:', !!description)
            console.log('- startTime:', !!startTime)
            console.log('- userId:', !!userId)

            return NextResponse.json(
                { error: 'Description, start time, and user ID are required' },
                { status: 400 }
            )
        }

        // Verify user exists
        console.log('Checking if user exists:', userId)
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        console.log('User found:', !!user)
        if (user) {
            console.log('User details:', { id: user.id, name: user.name, email: user.email })
        }

        if (!user) {
            console.log('User not found - returning 404')
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Verify project exists
        console.log('Checking if project exists:', projectId)
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        })

        console.log('Project found:', !!project)

        if (!project) {
            console.log('Project not found - returning 404')
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // If this is a running timer, check if user already has a running timer
        if (isRunning) {
            console.log('Checking for existing running timer')
            const existingRunningTimer = await prisma.timeEntry.findFirst({
                where: {
                    userId: userId,
                    isRunning: true
                }
            })

            console.log('Existing running timer found:', !!existingRunningTimer)

            if (existingRunningTimer) {
                console.log('User already has running timer - returning 400')
                return NextResponse.json(
                    { error: 'User already has a running timer' },
                    { status: 400 }
                )
            }
        }

        console.log('Creating time entry...')
        // Create the time entry
        const timeEntry = await prisma.timeEntry.create({
            data: {
                projectId,
                taskId: taskId || null,
                userId,
                categoryId: categoryId || null,
                description,
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                duration: duration || null,
                isRunning: isRunning || false,
                billable: billable !== undefined ? billable : true,
                hourlyRate: hourlyRate || null,
                notes: notes || null
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
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                },
                task: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        console.log('Time entry created successfully:', timeEntry.id)
        return NextResponse.json(timeEntry, { status: 201 })
    } catch (error) {
        console.error('Error creating time entry:', error)
        return NextResponse.json(
            { error: 'Failed to create time entry' },
            { status: 500 }
        )
    }
} 