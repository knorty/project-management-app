#!/usr/bin/env tsx

/**
 * Test Manual Entry Email Import
 * 
 * This script tests the manual entry functionality to ensure it works correctly.
 */

const API_BASE_URL = 'http://localhost:3004/api'

async function testManualEntry() {
    console.log('🧪 Testing Manual Entry Email Import\n')

    const manualEntryData = {
        source: 'manual',
        data: {
            subject: 'Manual Entry Test Thread',
            messages: [
                {
                    messageId: 'manual_test_001',
                    from: 'sender@test.com',
                    to: ['recipient1@test.com', 'recipient2@test.com'],
                    cc: ['cc@test.com'],
                    bcc: [],
                    subject: 'First Message',
                    body: '<p>This is the first message in the manual entry test.</p>',
                    textBody: 'This is the first message in the manual entry test.',
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    isRead: true,
                    isForwarded: false,
                    isReplied: false
                },
                {
                    messageId: 'manual_test_002',
                    from: 'recipient1@test.com',
                    to: ['sender@test.com'],
                    cc: ['cc@test.com'],
                    bcc: [],
                    subject: 'Re: First Message',
                    body: '<p>This is a reply to the first message.</p>',
                    textBody: 'This is a reply to the first message.',
                    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                    isRead: true,
                    isForwarded: false,
                    isReplied: true,
                    parentMessageId: 'manual_test_001'
                }
            ],
            participants: [
                { email: 'sender@test.com', name: 'Test Sender', role: 'FROM' as const },
                { email: 'recipient1@test.com', name: 'Test Recipient 1', role: 'TO' as const },
                { email: 'recipient2@test.com', name: 'Test Recipient 2', role: 'TO' as const },
                { email: 'cc@test.com', name: 'Test CC', role: 'CC' as const }
            ],
            tags: [
                { name: 'Manual Test', color: '#3b82f6' },
                { name: 'Test Thread', color: '#10b981' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        console.log('📧 Sending manual entry data...')

        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(manualEntryData)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Manual entry import successful!')
            console.log(`   Thread ID: ${result.thread.id}`)
            console.log(`   Subject: ${result.thread.subject}`)
            console.log(`   Messages imported: ${result.importedMessages}`)
            console.log(`   Participants: ${result.thread.participants?.length || 0}`)
            console.log(`   Tags: ${result.thread.tags?.length || 0}`)

            if (result.timeline) {
                console.log(`   Timeline generated: ${result.timeline.title}`)
                console.log(`   Timeline events: ${result.timeline.events?.length || 0}`)
            }
        } else {
            console.log('❌ Manual entry import failed!')
            console.log(`   Status: ${response.status}`)
            console.log(`   Error: ${result.error}`)
            if (result.details) {
                console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
            }
        }
    } catch (error) {
        console.log('❌ Error testing manual entry:')
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log('\n🏁 Manual entry test complete!')
}

// Run the test
testManualEntry().catch(console.error) 