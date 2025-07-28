#!/usr/bin/env tsx

import { EventType } from '@prisma/client'

// Test data for different import methods
const testForwardedEmail = {
    source: 'forwarded_email',
    data: {
        subject: 'Project Update Meeting',
        from: 'john.doe@company.com',
        to: 'jane.smith@company.com',
        cc: 'manager@company.com',
        bcc: '',
        body: '<p>Hi Jane,</p><p>Here is the update from our project meeting yesterday:</p><ul><li>Phase 1 is complete</li><li>Phase 2 starts next week</li><li>Budget is on track</li></ul><p>Best regards,<br>John</p>',
        textBody: 'Hi Jane,\n\nHere is the update from our project meeting yesterday:\n- Phase 1 is complete\n- Phase 2 starts next week\n- Budget is on track\n\nBest regards,\nJohn',
        timestamp: new Date().toISOString(),
        attachments: [
            {
                filename: 'meeting-notes.pdf',
                contentType: 'application/pdf',
                size: 1024000,
                url: 'https://example.com/meeting-notes.pdf'
            }
        ]
    },
    options: { autoGenerateTimeline: true }
}

const testManualEntry = {
    source: 'manual',
    data: {
        subject: 'Client Feedback Thread',
        messages: [
            {
                messageId: 'msg_001',
                from: 'client@example.com',
                to: ['project.manager@company.com'],
                cc: ['designer@company.com'],
                bcc: [],
                subject: 'Initial Feedback',
                body: '<p>Hi team,</p><p>I have some initial feedback on the design:</p><p>1. The color scheme looks great</p><p>2. Need to adjust the layout</p><p>3. Font size should be larger</p><p>Thanks!</p>',
                textBody: 'Hi team,\n\nI have some initial feedback on the design:\n1. The color scheme looks great\n2. Need to adjust the layout\n3. Font size should be larger\n\nThanks!',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                isRead: true,
                isForwarded: false,
                isReplied: false
            },
            {
                messageId: 'msg_002',
                from: 'project.manager@company.com',
                to: ['client@example.com'],
                cc: ['designer@company.com'],
                bcc: [],
                subject: 'Re: Initial Feedback',
                body: '<p>Hi Client,</p><p>Thank you for the feedback! We will make those adjustments.</p><p>I have a few questions:</p><p>1. Which specific layout elements need adjustment?</p><p>2. What font size would you prefer?</p><p>Best regards,<br>Project Manager</p>',
                textBody: 'Hi Client,\n\nThank you for the feedback! We will make those adjustments.\n\nI have a few questions:\n1. Which specific layout elements need adjustment?\n2. What font size would you prefer?\n\nBest regards,\nProject Manager',
                timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                isRead: true,
                isForwarded: false,
                isReplied: true,
                parentMessageId: 'msg_001'
            },
            {
                messageId: 'msg_003',
                from: 'client@example.com',
                to: ['project.manager@company.com'],
                cc: ['designer@company.com'],
                bcc: [],
                subject: 'Re: Initial Feedback',
                body: '<p>Hi Project Manager,</p><p>Thanks for the quick response!</p><p>For the layout: the sidebar should be on the right instead of left</p><p>For the font: 16px would be perfect</p><p>Looking forward to the updates!</p>',
                textBody: 'Hi Project Manager,\n\nThanks for the quick response!\n\nFor the layout: the sidebar should be on the right instead of left\nFor the font: 16px would be perfect\n\nLooking forward to the updates!',
                timestamp: new Date().toISOString(),
                isRead: false,
                isForwarded: false,
                isReplied: true,
                parentMessageId: 'msg_002'
            }
        ],
        participants: [
            { email: 'client@example.com', name: 'Client Name', role: 'FROM' as const },
            { email: 'project.manager@company.com', name: 'Project Manager', role: 'TO' as const },
            { email: 'designer@company.com', name: 'Designer', role: 'CC' as const }
        ],
        tags: [
            { name: 'Client Feedback', color: '#3b82f6' },
            { name: 'Design', color: '#10b981' }
        ]
    },
    options: { autoGenerateTimeline: true }
}

const testEmailFile = {
    source: 'email_file',
    data: {
        emlContent: `From: sender@example.com
To: recipient@example.com
Subject: Test Email Import
Date: ${new Date().toISOString()}
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h1>Test Email</h1>
<p>This is a test email for importing.</p>
<p>It contains multiple paragraphs and formatting.</p>
</body>
</html>`,
        subject: 'Test Email Import',
        from: 'sender@example.com',
        to: 'recipient@example.com',
        timestamp: new Date().toISOString()
    },
    options: { autoGenerateTimeline: true }
}

const testApiIntegration = {
    source: 'api_integration',
    data: {
        threadId: 'gmail_thread_123',
        subject: 'API Integration Test',
        messages: [
            {
                messageId: 'gmail_msg_001',
                from: 'api.sender@gmail.com',
                to: ['api.recipient@gmail.com'],
                cc: [],
                bcc: [],
                subject: 'API Integration Test',
                body: '<p>This is a test email from Gmail API integration.</p>',
                textBody: 'This is a test email from Gmail API integration.',
                timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                isRead: true,
                isForwarded: false,
                isReplied: false
            }
        ],
        participants: [
            { email: 'api.sender@gmail.com', name: 'API Sender', role: 'FROM' as const },
            { email: 'api.recipient@gmail.com', name: 'API Recipient', role: 'TO' as const }
        ],
        tags: [
            { name: 'API Test', color: '#f59e0b' }
        ]
    },
    options: { autoGenerateTimeline: true }
}

async function testEmailImport() {
    const baseUrl = 'http://localhost:3000/api'

    console.log('🧪 Testing Email Import Functionality\n')

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

    // Test duplicate import prevention
    console.log('\n\n🔄 Testing Duplicate Import Prevention')
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

    console.log('\n\n🏁 Email Import Testing Complete!')
}

// Run the tests
testEmailImport().catch(console.error) 