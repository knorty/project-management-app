import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
    try {
        console.log('Checking users in database...')

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        console.log('Users found:', users.length)
        users.forEach(user => {
            console.log(`- ID: ${user.id}`)
            console.log(`  Name: ${user.name}`)
            console.log(`  Email: ${user.email}`)
            console.log(`  Role: ${user.role}`)
            console.log(`  Created: ${user.createdAt}`)
            console.log('')
        })

        // Check for duplicate emails
        const aliceUsers = users.filter(user => user.email === 'alice@example.com')
        console.log(`Alice users found: ${aliceUsers.length}`)
        aliceUsers.forEach(user => {
            console.log(`  - ID: ${user.id}, Created: ${user.createdAt}`)
        })

        // Check if the session user ID exists
        const sessionUserId = 'cmdudjrh40000pfe28dh2l8mj'
        const sessionUser = await prisma.user.findUnique({
            where: { id: sessionUserId }
        })

        console.log(`Session user ID ${sessionUserId} exists:`, !!sessionUser)

        if (sessionUser) {
            console.log('Session user details:', {
                id: sessionUser.id,
                name: sessionUser.name,
                email: sessionUser.email,
                role: sessionUser.role
            })
        }

    } catch (error) {
        console.error('Error checking users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUsers() 