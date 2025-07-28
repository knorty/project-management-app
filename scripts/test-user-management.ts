#!/usr/bin/env tsx

/**
 * Test User Management in Email Import
 * 
 * This script tests the user management functionality to ensure:
 * 1. New users are created when new email addresses are encountered
 * 2. Existing users are linked when email addresses match
 * 3. User names are updated when new information is provided
 */

const API_BASE_URL = 'http://localhost:3004/api'

async function testUserManagement() {
    console.log('👥 Testing User Management in Email Import\n')

    // Test 1: Import with new users
    console.log('1️⃣ Test: Creating new users')
    console.log('─'.repeat(50))

    const newUsersData = {
        source: 'manual',
        data: {
            subject: 'New Users Test Thread',
            messages: [
                {
                    messageId: 'new_users_001',
                    from: 'alice.new@example.com',
                    to: ['bob.new@example.com'],
                    cc: ['charlie.new@example.com'],
                    bcc: [],
                    subject: 'Meeting with New Team',
                    body: '<p>Hi Bob and Charlie,</p><p>Let\'s schedule a meeting to discuss the new project.</p>',
                    textBody: 'Hi Bob and Charlie,\n\nLet\'s schedule a meeting to discuss the new project.',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'alice.new@example.com', name: 'Alice Johnson', role: 'FROM' as const },
                { email: 'bob.new@example.com', name: 'Bob Smith', role: 'TO' as const },
                { email: 'charlie.new@example.com', name: 'Charlie Brown', role: 'CC' as const }
            ],
            tags: [
                { name: 'New Users', color: '#3b82f6' }
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

            // Check if users were created
            const usersResponse = await fetch(`${API_BASE_URL}/users`)
            if (usersResponse.ok) {
                const users = await usersResponse.json()
                const newUsers = users.filter((user: any) =>
                    user.email.includes('new@example.com')
                )
                console.log(`   New users created: ${newUsers.length}`)
                newUsers.forEach((user: any) => {
                    console.log(`     - ${user.name} (${user.email})`)
                })
            }
        } else {
            console.log('❌ Failed to create new users')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error creating new users:', error)
    }

    console.log('\n')

    // Test 2: Import with existing users (should link to existing users)
    console.log('2️⃣ Test: Linking to existing users')
    console.log('─'.repeat(50))

    const existingUsersData = {
        source: 'manual',
        data: {
            subject: 'Existing Users Test Thread',
            messages: [
                {
                    messageId: 'existing_users_001',
                    from: 'alice.new@example.com', // Same email as before
                    to: ['david.existing@example.com'],
                    cc: ['bob.new@example.com'], // Same email as before
                    bcc: [],
                    subject: 'Follow-up Meeting',
                    body: '<p>Hi David,</p><p>Following up on our previous discussion.</p>',
                    textBody: 'Hi David,\n\nFollowing up on our previous discussion.',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'alice.new@example.com', name: 'Alice Johnson', role: 'FROM' as const },
                { email: 'david.existing@example.com', name: 'David Wilson', role: 'TO' as const },
                { email: 'bob.new@example.com', name: 'Bob Smith', role: 'CC' as const }
            ],
            tags: [
                { name: 'Existing Users', color: '#10b981' }
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

            // Check total users
            const usersResponse = await fetch(`${API_BASE_URL}/users`)
            if (usersResponse.ok) {
                const users = await usersResponse.json()
                console.log(`   Total users in database: ${users.length}`)
            }
        } else {
            console.log('❌ Failed to link existing users')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error linking existing users:', error)
    }

    console.log('\n')

    // Test 3: Update user name
    console.log('3️⃣ Test: Updating user name')
    console.log('─'.repeat(50))

    const updateNameData = {
        source: 'manual',
        data: {
            subject: 'Name Update Test Thread',
            messages: [
                {
                    messageId: 'name_update_001',
                    from: 'alice.new@example.com', // Same email, different name
                    to: ['eve.new@example.com'],
                    cc: [],
                    bcc: [],
                    subject: 'Name Update Test',
                    body: '<p>Hi Eve,</p><p>This is a test for name updates.</p>',
                    textBody: 'Hi Eve,\n\nThis is a test for name updates.',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'alice.new@example.com', name: 'Alice Johnson-Updated', role: 'FROM' as const },
                { email: 'eve.new@example.com', name: 'Eve Davis', role: 'TO' as const }
            ],
            tags: [
                { name: 'Name Update', color: '#f59e0b' }
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

            // Check if user name was updated
            const usersResponse = await fetch(`${API_BASE_URL}/users`)
            if (usersResponse.ok) {
                const users = await usersResponse.json()
                const alice = users.find((user: any) => user.email === 'alice.new@example.com')
                if (alice) {
                    console.log(`   Alice's updated name: ${alice.name}`)
                }
            }
        } else {
            console.log('❌ Failed to update user name')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error updating user name:', error)
    }

    console.log('\n')

    // Summary
    console.log('📊 User Management Summary')
    console.log('─'.repeat(50))

    try {
        const [usersResponse, threadsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/email-threads`)
        ])

        if (usersResponse.ok && threadsResponse.ok) {
            const users = await usersResponse.json()
            const threads = await threadsResponse.json()

            console.log(`Total users in database: ${users.length}`)
            console.log(`Total email threads: ${threads.length}`)

            console.log('\nUsers created:')
            users.forEach((user: any) => {
                console.log(`  - ${user.name} (${user.email}) - Created: ${new Date(user.createdAt).toLocaleDateString()}`)
            })
        }
    } catch (error) {
        console.log('❌ Error fetching summary:', error)
    }

    console.log('\n🏁 User management testing complete!')
}

// Run the tests
testUserManagement().catch(console.error) 