import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Stop all running timers for this user
        const now = new Date()

        // First, get all running timers to calculate their durations
        const runningTimers = await prisma.timeEntry.findMany({
            where: {
                projectId: projectId,
                userId: userId,
                isRunning: true
            }
        })

        // Update each running timer with proper duration calculation
        for (const timer of runningTimers) {
            const startTime = new Date(timer.startTime)
            const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000)

            await prisma.timeEntry.update({
                where: { id: timer.id },
                data: {
                    isRunning: false,
                    endTime: now,
                    duration: duration
                }
            })
        }

        return NextResponse.json({
            message: `Cleared ${runningTimers.length} running timer(s)`,
            count: runningTimers.length
        })
    } catch (error) {
        console.error('Error clearing running timers:', error)
        return NextResponse.json(
            { error: 'Failed to clear running timers' },
            { status: 500 }
        )
    }
} 