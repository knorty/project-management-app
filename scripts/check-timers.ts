import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTimers() {
    try {
        console.log('Checking running timers...')

        const runningTimers = await prisma.timeEntry.findMany({
            where: {
                isRunning: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        console.log('Running timers found:', runningTimers.length)
        runningTimers.forEach(timer => {
            console.log(`- ID: ${timer.id}`)
            console.log(`  User: ${timer.user.name} (${timer.user.email})`)
            console.log(`  Project: ${timer.project.name}`)
            console.log(`  Description: ${timer.description}`)
            console.log(`  Start Time: ${timer.startTime}`)
            console.log(`  Duration: ${timer.duration} seconds`)
            console.log('')
        })

        // Clear running timers for Alice
        const aliceUserId = 'cmduegtb60000pfbc9tjec0bs'
        const aliceRunningTimers = runningTimers.filter(timer => timer.user.id === aliceUserId)

        if (aliceRunningTimers.length > 0) {
            console.log(`Found ${aliceRunningTimers.length} running timer(s) for Alice`)

            for (const timer of aliceRunningTimers) {
                const now = new Date()
                const startTime = new Date(timer.startTime)
                const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000)

                console.log(`Stopping timer ${timer.id} with duration ${duration} seconds`)

                await prisma.timeEntry.update({
                    where: { id: timer.id },
                    data: {
                        isRunning: false,
                        endTime: now,
                        duration: duration
                    }
                })
            }

            console.log('All running timers for Alice have been stopped')
        } else {
            console.log('No running timers found for Alice')
        }

    } catch (error) {
        console.error('Error checking timers:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkTimers() 