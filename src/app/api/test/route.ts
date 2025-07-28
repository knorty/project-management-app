import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Get some sample data to verify seeding worked
        const stats = await Promise.all([
            prisma.user.count(),
            prisma.emailThread.count(),
            prisma.emailMessage.count(),
            prisma.timelineView.count(),
            prisma.project.count(),
            prisma.task.count()
        ])

        const [userCount, threadCount, messageCount, timelineCount, projectCount, taskCount] = stats

        return NextResponse.json({
            success: true,
            message: 'Database is working correctly!',
            stats: {
                users: userCount,
                emailThreads: threadCount,
                emailMessages: messageCount,
                timelineViews: timelineCount,
                projects: projectCount,
                tasks: taskCount
            },
            sampleData: {
                users: await prisma.user.findMany({ take: 3 }),
                threads: await prisma.emailThread.findMany({
                    take: 2,
                    include: {
                        participants: true,
                        tags: true,
                        _count: {
                            select: { messages: true }
                        }
                    }
                })
            }
        })
    } catch (error) {
        console.error('Error testing database:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 