import { EventType } from '@prisma/client'

// Test data for different import methods with unique content
const testForwardedEmail = {
    source: 'forwarded_email',
    data: {
        subject: 'Fresh Project Update Meeting',
        from: 'alice.johnson@company.com',
        to: 'bob.wilson@company.com',
        cc: 'charlie.brown@company.com',
        bcc: '',
        body: '<p>Hi Bob,</p><p>Here is the fresh update from our project meeting today:</p><ul><li>Phase 3 is starting</li><li>New team members added</li><li>Budget increased by 10%</li></ul><p>Best regards,<br>Alice</p>',
        textBody: 'Hi Bob,\n\nHere is the fresh update from our project meeting today:\n- Phase 3 is starting\n- New team members added\n- Budget increased by 10%\n\nBest regards,\nAlice',
        timestamp: new Date().toISOString(),
        attachments: [
            {
                filename: 'fresh-meeting-notes.pdf',
                contentType: 'application/pdf',
                size: 2048000,
                url: 'https://example.com/fresh-meeting-notes.pdf'
            }
        ]
    },
    options: { autoGenerateTimeline: true }
}

const testManualEntry = {
    source: 'manual',
    data: {
        subject: 'Fresh Client Feedback Thread',
        messages: [
            {
                messageId: 'fresh_msg_001',
                from: 'newclient@example.com',
                to: ['newproject.manager@company.com'],
                cc: ['newdesigner@company.com'],
                bcc: [],
                subject: 'Fresh Initial Feedback',
                body: '<p>Hi team,</p><p>I have some fresh feedback on the design:</p><p>1. The new color scheme looks amazing</p><p>2. Need to adjust the navigation</p><p>3. Button size should be larger</p><p>Thanks!</p>',
                textBody: 'Hi team,\n\nI have some fresh feedback on the design:\n1. The new color scheme looks amazing\n2. Need to adjust the navigation\n3. Button size should be larger\n\nThanks!',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                isRead: true,
                isForwarded: false,
                isReplied: false
            },
            {
                messageId: 'fresh_msg_002',
                from: 'newproject.manager@company.com',
                to: ['newclient@example.com'],
                cc: ['newdesigner@company.com'],
                bcc: [],
                subject: 'Re: Fresh Initial Feedback',
                body: '<p>Hi New Client,</p><p>Thank you for the fresh feedback! We will make those adjustments.</p><p>I have a few questions:</p><p>1. Which navigation elements need adjustment?</p><p>2. What button size would you prefer?</p><p>Best regards,<br>New Project Manager</p>',
                textBody: 'Hi New Client,\n\nThank you for the fresh feedback! We will make those adjustments.\n\nI have a few questions:\n1. Which navigation elements need adjustment?\n2. What button size would you prefer?\n\nBest regards,\nNew Project Manager',
                timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                isRead: true,
                isForwarded: false,
                isReplied: true,
                parentMessageId: 'fresh_msg_001'
            }
        ],
        participants: [
            { email: 'newclient@example.com', name: 'New Client Name', role: 'FROM' as const },
            { email: 'newproject.manager@company.com', name: 'New Project Manager', role: 'TO' as const },
            { email: 'newdesigner@company.com', name: 'New Designer', role: 'CC' as const }
        ],
        tags: [
            { name: 'Fresh Client Feedback', color: '#8b5cf6' },
            { name: 'New Design', color: '#06b6d4' }
        ]
    },
    options: { autoGenerateTimeline: true }
}

const testEmailFile = {
    source: 'email_file',
    data: {
        emlContent: `From: freshsender@example.com
To: freshrecipient@example.com
Subject: Fresh Test Email Import
Date: ${new Date().toISOString()}
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h1>Fresh Test Email</h1>
<p>This is a fresh test email for importing.</p>
<p>It contains multiple paragraphs and fresh formatting.</p>
</body>
</html>`,
        subject: 'Fresh Test Email Import',
        from: 'freshsender@example.com',
        to: 'freshrecipient@example.com',
        timestamp: new Date().toISOString()
    },
    options: { autoGenerateTimeline: true }
}

const testApiIntegration = {
    source: 'api_integration',
    data: {
        threadId: 'fresh_gmail_thread_456',
        subject: 'Fresh API Integration Test',
        messages: [
            {
                messageId: 'fresh_gmail_msg_001',
                from: 'fresh.api.sender@gmail.com',
                to: ['fresh.api.recipient@gmail.com'],
                cc: [],
                bcc: [],
                subject: 'Fresh API Integration Test',
                body: '<p>This is a fresh test email from Gmail API integration.</p>',
                textBody: 'This is a fresh test email from Gmail API integration.',
                timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                isRead: true,
                isForwarded: false,
                isReplied: false
            }
        ],
        participants: [
            { email: 'fresh.api.sender@gmail.com', name: 'Fresh API Sender', role: 'FROM' as const },
            { email: 'fresh.api.recipient@gmail.com', name: 'Fresh API Recipient', role: 'TO' as const }
        ],
        tags: [
            { name: 'Fresh API Test', color: '#ec4899' }
        ]
    },
    options: { autoGenerateTimeline: true }
}

async function testEmailImport() {
    const baseUrl = 'http://localhost:3000/api'

    console.log('🧪 Testing Email Import Functionality (Fresh Data)\n')

    const tests = [
        { name: 'Forwarded Email Import', data: testForwardedEmail },
        { name: 'Manual Entry Import', data: testManualEntry },
        { name: 'Email File Import', data: testEmailFile },
        { name: 'API Integration Import', data: testApiIntegration }
    ]

    for (const test of tests) {
        console.log(`\n📧 Testing: ${test.name}`)
        console.log('─'.repeat(50))

        try {
            const response = await fetch(`${baseUrl}/email-import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.data)
            })

            const result = await response.json()

            if (response.ok) {
                console.log('✅ Success!')
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
                console.log('❌ Failed!')
                console.log(`   Status: ${response.status}`)
                console.log(`   Error: ${result.error}`)
                if (result.details) {
                    console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
                }
            }
        } catch (error) {
            console.log('❌ Error!')
            console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Test duplicate import prevention with fresh data
    console.log('\n\n🔄 Testing Duplicate Import Prevention (Fresh Data)')
    console.log('─'.repeat(50))

    try {
        const response = await fetch(`${baseUrl}/email-import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...testForwardedEmail,
                options: { ...testForwardedEmail.options, allowDuplicate: false }
            })
        })

        const result = await response.json()

        if (response.status === 409) {
            console.log('✅ Duplicate prevention working!')
            console.log(`   Thread already exists: ${result.threadId}`)
        } else {
            console.log('❌ Duplicate prevention not working as expected')
            console.log(`   Status: ${response.status}`)
            console.log(`   Result: ${JSON.stringify(result, null, 2)}`)
        }
    } catch (error) {
        console.log('❌ Error testing duplicate prevention!')
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test validation
    console.log('\n\n🔍 Testing Validation')
    console.log('─'.repeat(50))

    const invalidData = {
        source: 'manual',
        data: {
            subject: '', // Missing subject
            messages: [] // Empty messages
        }
    }

    try {
        const response = await fetch(`${baseUrl}/email-import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invalidData)
        })

        const result = await response.json()

        if (response.status === 400) {
            console.log('✅ Validation working!')
            console.log(`   Errors: ${result.details?.join(', ')}`)
        } else {
            console.log('❌ Validation not working as expected')
            console.log(`   Status: ${response.status}`)
            console.log(`   Result: ${JSON.stringify(result, null, 2)}`)
        }
    } catch (error) {
        console.log('❌ Error testing validation!')
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test the frontend by checking if we can fetch the imported threads
    console.log('\n\n🌐 Testing Frontend Integration')
    console.log('─'.repeat(50))

    try {
        const [threadsResponse, timelinesResponse] = await Promise.all([
            fetch(`${baseUrl}/email-threads`),
            fetch(`${baseUrl}/timelines`)
        ])

        const threads = await threadsResponse.json()
        const timelines = await timelinesResponse.json()

        console.log('✅ Frontend data accessible!')
        console.log(`   Total email threads: ${threads.length}`)
        console.log(`   Total timelines: ${timelines.length}`)

        // Check for our fresh imported threads
        const freshThreads = threads.filter((thread: any) =>
            thread.subject.includes('Fresh') ||
            thread.subject.includes('fresh')
        )
        console.log(`   Fresh imported threads: ${freshThreads.length}`)

        const freshTimelines = timelines.filter((timeline: any) =>
            timeline.title.includes('Fresh') ||
            timeline.title.includes('fresh')
        )
        console.log(`   Fresh generated timelines: ${freshTimelines.length}`)

    } catch (error) {
        console.log('❌ Error testing frontend integration!')
        console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log('\n\n🏁 Fresh Email Import Testing Complete!')
}

// Run the tests
testEmailImport().catch(console.error) 