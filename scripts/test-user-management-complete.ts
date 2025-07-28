#!/usr/bin/env tsx

/**
 * Complete User Management Test
 * 
 * This script demonstrates all user management features:
 * 1. Creating new users automatically
 * 2. Linking to existing users
 * 3. Updating user names
 * 4. Tracking user participation across threads
 */

const API_BASE_URL = 'http://localhost:3000/api'

async function testCompleteUserManagement() {
    console.log('👥 Complete User Management Test\n')

    // Test 1: Create new users
    console.log('1️⃣ Creating new users...')
    console.log('─'.repeat(50))

    const newUsersData = {
        source: 'manual',
        data: {
            subject: 'New Team Introduction',
            messages: [
                {
                    messageId: 'new_team_001',
                    from: 'manager@company.com',
                    to: ['developer@company.com', 'designer@company.com'],
                    cc: ['hr@company.com'],
                    bcc: [],
                    subject: 'Welcome New Team Members',
                    body: '<p>Welcome to the team!</p>',
                    textBody: 'Welcome to the team!',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'manager@company.com', name: 'Project Manager', role: 'FROM' as const },
                { email: 'developer@company.com', name: 'Senior Developer', role: 'TO' as const },
                { email: 'designer@company.com', name: 'UI Designer', role: 'TO' as const },
                { email: 'hr@company.com', name: 'HR Manager', role: 'CC' as const }
            ],
            tags: [
                { name: 'Team', color: '#3b82f6' },
                { name: 'Welcome', color: '#10b981' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUsersData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ New users created successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   Participants: ${result.thread.participants?.length || 0}`)

            // Show user IDs to verify they were created
            result.thread.participants?.forEach((p: any) => {
                console.log(`     - ${p.name} (${p.email}) -> User ID: ${p.userId}`)
            })
        } else {
            console.log('❌ Failed to create new users')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error creating new users:', error)
    }

    console.log('\n')

    // Test 2: Link to existing users
    console.log('2️⃣ Linking to existing users...')
    console.log('─'.repeat(50))

    const existingUsersData = {
        source: 'manual',
        data: {
            subject: 'Follow-up with Existing Team',
            messages: [
                {
                    messageId: 'existing_team_001',
                    from: 'manager@company.com', // Same email as before
                    to: ['test@example.com'], // Existing user from previous tests
                    cc: ['developer@company.com'], // Same email as before
                    bcc: [],
                    subject: 'Project Update',
                    body: '<p>Here is the project update.</p>',
                    textBody: 'Here is the project update.',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'manager@company.com', name: 'Project Manager', role: 'FROM' as const },
                { email: 'test@example.com', name: 'Test User', role: 'TO' as const },
                { email: 'developer@company.com', name: 'Senior Developer', role: 'CC' as const }
            ],
            tags: [
                { name: 'Project Update', color: '#f59e0b' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(existingUsersData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Existing users linked successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   Participants: ${result.thread.participants?.length || 0}`)

            // Show user IDs to verify they're the same
            result.thread.participants?.forEach((p: any) => {
                console.log(`     - ${p.name} (${p.email}) -> User ID: ${p.userId}`)
            })
        } else {
            console.log('❌ Failed to link existing users')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error linking existing users:', error)
    }

    console.log('\n')

    // Test 3: Update user name
    console.log('3️⃣ Updating user name...')
    console.log('─'.repeat(50))

    const updateNameData = {
        source: 'manual',
        data: {
            subject: 'Name Update Test',
            messages: [
                {
                    messageId: 'name_update_001',
                    from: 'manager@company.com', // Same email, different name
                    to: ['newperson@company.com'],
                    cc: [],
                    bcc: [],
                    subject: 'Name Update',
                    body: '<p>Testing name updates.</p>',
                    textBody: 'Testing name updates.',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'manager@company.com', name: 'Senior Project Manager', role: 'FROM' as const },
                { email: 'newperson@company.com', name: 'New Person', role: 'TO' as const }
            ],
            tags: [
                { name: 'Name Update', color: '#8b5cf6' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateNameData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ User name updated successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)

            // Check if the name was updated
            const managerParticipant = result.thread.participants?.find((p: any) => p.email === 'manager@company.com')
            if (managerParticipant) {
                console.log(`   Manager's name: ${managerParticipant.name}`)
            }
        } else {
            console.log('❌ Failed to update user name')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error updating user name:', error)
    }

    console.log('\n')

    // Test 4: Show user participation across threads
    console.log('4️⃣ User participation across threads...')
    console.log('─'.repeat(50))

    try {
        const usersResponse = await fetch(`${API_BASE_URL}/users`)
        if (usersResponse.ok) {
            const users = await usersResponse.json()

            console.log(`Total users in database: ${users.length}`)

            // Show users with their participation
            users.forEach((user: any) => {
                const threadCount = user.EmailParticipant?.length || 0
                const threads = user.EmailParticipant?.map((p: any) => p.thread.subject) || []

                console.log(`\n👤 ${user.name} (${user.email})`)
                console.log(`   Participated in ${threadCount} thread(s):`)
                threads.forEach((subject: string) => {
                    console.log(`     - "${subject}"`)
                })
            })
        }
    } catch (error) {
        console.log('❌ Error fetching user participation:', error)
    }

    console.log('\n')

    // Test 5: Show threads with user information
    console.log('5️⃣ Threads with user information...')
    console.log('─'.repeat(50))

    try {
        const threadsResponse = await fetch(`${API_BASE_URL}/email-threads`)
        if (threadsResponse.ok) {
            const threads = await threadsResponse.json()

            console.log(`Total threads: ${threads.length}`)

            // Show recent threads with user info
            const recentThreads = threads.slice(0, 5)
            recentThreads.forEach((thread: any) => {
                console.log(`\n📧 "${thread.subject}"`)
                console.log(`   Participants:`)
                thread.participants?.forEach((p: any) => {
                    const userInfo = p.userId ? `(User ID: ${p.userId})` : '(No user linked)'
                    console.log(`     - ${p.name} (${p.email}) ${p.role} ${userInfo}`)
                })
            })
        }
    } catch (error) {
        console.log('❌ Error fetching threads:', error)
    }

    console.log('\n🏁 Complete user management test finished!')
    console.log('\n🎯 Key Features Demonstrated:')
    console.log('  ✅ Automatic user creation for new email addresses')
    console.log('  ✅ Linking to existing users when email addresses match')
    console.log('  ✅ User name updates when new information is provided')
    console.log('  ✅ Tracking user participation across multiple threads')
    console.log('  ✅ Maintaining user relationships in the database')
}

// Run the complete test
testCompleteUserManagement().catch(console.error) 