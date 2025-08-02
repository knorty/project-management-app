import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    try {
        const { id: projectId, entryId } = await params

        const timeEntry = await prisma.timeEntry.findFirst({
            where: {
                id: entryId,
                projectId: projectId
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

        if (!timeEntry) {
            return NextResponse.json(
                { error: 'Time entry not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(timeEntry)
    } catch (error) {
        console.error('Error fetching time entry:', error)
        return NextResponse.json(
            { error: 'Failed to fetch time entry' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    try {
        const { id: projectId, entryId } = await params
        const body = await request.json()

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
            notes
        } = body

        // Check if time entry exists
        const existingEntry = await prisma.timeEntry.findFirst({
            where: {
                id: entryId,
                projectId: projectId
            }
        })

        if (!existingEntry) {
            return NextResponse.json(
                { error: 'Time entry not found' },
                { status: 404 }
            )
        }

        // If this is being set to running, check if user already has a running timer
        if (isRunning && !existingEntry.isRunning) {
            const existingRunningTimer = await prisma.timeEntry.findFirst({
                where: {
                    userId: existingEntry.userId,
                    isRunning: true,
                    id: { not: entryId }
                }
            })

            if (existingRunningTimer) {
                return NextResponse.json(
                    { error: 'User already has a running timer' },
                    { status: 400 }
                )
            }
        }

        // Update the time entry
        const updatedEntry = await prisma.timeEntry.update({
            where: {
                id: entryId
            },
            data: {
                taskId: taskId !== undefined ? (taskId || null) : undefined,
                categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
                description: description || undefined,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime !== undefined ? (endTime ? new Date(endTime) : null) : undefined,
                duration: duration !== undefined ? duration : undefined,
                isRunning: isRunning !== undefined ? isRunning : undefined,
                billable: billable !== undefined ? billable : undefined,
                hourlyRate: hourlyRate !== undefined ? hourlyRate : undefined,
                notes: notes !== undefined ? notes : undefined
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

        return NextResponse.json(updatedEntry)
    } catch (error) {
        console.error('Error updating time entry:', error)
        return NextResponse.json(
            { error: 'Failed to update time entry' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    try {
        const { id: projectId, entryId } = await params

        // Check if time entry exists
        const existingEntry = await prisma.timeEntry.findFirst({
            where: {
                id: entryId,
                projectId: projectId
            }
        })

        if (!existingEntry) {
            return NextResponse.json(
                { error: 'Time entry not found' },
                { status: 404 }
            )
        }

        // Delete the time entry
        await prisma.timeEntry.delete({
            where: {
                id: entryId
            }
        })

        return NextResponse.json({ message: 'Time entry deleted successfully' })
    } catch (error) {
        console.error('Error deleting time entry:', error)
        return NextResponse.json(
            { error: 'Failed to delete time entry' },
            { status: 500 }
        )
    }
} 