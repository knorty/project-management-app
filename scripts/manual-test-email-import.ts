#!/usr/bin/env tsx

/**
 * Manual Test Script for Email Import Functionality
 * 
 * This script demonstrates how to use the email import API with real-world examples.
 * It shows different import methods and their use cases.
 */

const API_BASE_URL = 'http://localhost:3000/api'

async function manualTestEmailImport() {
    console.log('📧 Manual Email Import Test Examples\n')
    console.log('This script demonstrates real-world email import scenarios.\n')

    // Example 1: Import a forwarded email from a client
    console.log('1️⃣ Example: Importing a forwarded client email')
    console.log('─'.repeat(60))

    const clientEmail = {
        source: 'forwarded_email',
        data: {
            subject: 'Client Feedback - Website Redesign',
            from: 'client@acmecorp.com',
            to: 'project.manager@ourcompany.com',
            cc: 'designer@ourcompany.com',
            bcc: '',
            body: `<p>Hi Project Manager,</p>
<p>I wanted to share some feedback on the website redesign project:</p>
<ul>
<li>The new homepage layout looks great</li>
<li>Navigation is much more intuitive</li>
<li>Mobile responsiveness is excellent</li>
<li>Need to adjust the contact form placement</li>
</ul>
<p>Overall, we're very pleased with the progress!</p>
<p>Best regards,<br>Sarah Johnson<br>Marketing Director, Acme Corp</p>`,
            textBody: `Hi Project Manager,

I wanted to share some feedback on the website redesign project:

- The new homepage layout looks great
- Navigation is much more intuitive  
- Mobile responsiveness is excellent
- Need to adjust the contact form placement

Overall, we're very pleased with the progress!

Best regards,
Sarah Johnson
Marketing Director, Acme Corp`,
            timestamp: new Date().toISOString(),
            attachments: [
                {
                    filename: 'client-feedback-document.pdf',
                    contentType: 'application/pdf',
                    size: 512000,
                    url: 'https://acmecorp.com/documents/feedback.pdf'
                }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientEmail)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Client email imported successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   Client: ${result.thread.participants[0]?.email}`)
            console.log(`   Timeline: ${result.timeline ? 'Generated' : 'Not generated'}`)
        } else {
            console.log('❌ Failed to import client email')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error importing client email:', error)
    }

    console.log('\n')

    // Example 2: Import a multi-message support thread
    console.log('2️⃣ Example: Importing a support ticket thread')
    console.log('─'.repeat(60))

    const supportThread = {
        source: 'manual',
        data: {
            subject: 'Support Ticket #12345 - Login Issue',
            messages: [
                {
                    messageId: 'support_001',
                    from: 'user@example.com',
                    to: ['support@ourcompany.com'],
                    cc: [],
                    bcc: [],
                    subject: 'Support Ticket #12345 - Login Issue',
                    body: `<p>Hi Support Team,</p>
<p>I'm having trouble logging into my account. I keep getting an error message saying "Invalid credentials" even though I'm sure my password is correct.</p>
<p>Can you help me resolve this?</p>
<p>Thanks,<br>John Smith</p>`,
                    textBody: `Hi Support Team,

I'm having trouble logging into my account. I keep getting an error message saying "Invalid credentials" even though I'm sure my password is correct.

Can you help me resolve this?

Thanks,
John Smith`,
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    isRead: true,
                    isForwarded: false,
                    isReplied: false
                },
                {
                    messageId: 'support_002',
                    from: 'support@ourcompany.com',
                    to: ['user@example.com'],
                    cc: [],
                    bcc: [],
                    subject: 'Re: Support Ticket #12345 - Login Issue',
                    body: `<p>Hi John,</p>
<p>Thank you for contacting support. I can help you with this login issue.</p>
<p>Could you please try the following steps:</p>
<ol>
<li>Clear your browser cache and cookies</li>
<li>Try logging in with a different browser</li>
<li>Reset your password using the "Forgot Password" link</li>
</ol>
<p>Let me know if you're still experiencing issues after trying these steps.</p>
<p>Best regards,<br>Support Team</p>`,
                    textBody: `Hi John,

Thank you for contacting support. I can help you with this login issue.

Could you please try the following steps:
1. Clear your browser cache and cookies
2. Try logging in with a different browser  
3. Reset your password using the "Forgot Password" link

Let me know if you're still experiencing issues after trying these steps.

Best regards,
Support Team`,
                    timestamp: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
                    isRead: true,
                    isForwarded: false,
                    isReplied: true,
                    parentMessageId: 'support_001'
                },
                {
                    messageId: 'support_003',
                    from: 'user@example.com',
                    to: ['support@ourcompany.com'],
                    cc: [],
                    bcc: [],
                    subject: 'Re: Support Ticket #12345 - Login Issue',
                    body: `<p>Hi Support Team,</p>
<p>Thank you for the suggestions. I tried clearing my cache and resetting my password, and now I can log in successfully!</p>
<p>Issue resolved. Thanks for your help!</p>
<p>Best regards,<br>John Smith</p>`,
                    textBody: `Hi Support Team,

Thank you for the suggestions. I tried clearing my cache and resetting my password, and now I can log in successfully!

Issue resolved. Thanks for your help!

Best regards,
John Smith`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isForwarded: false,
                    isReplied: true,
                    parentMessageId: 'support_002'
                }
            ],
            participants: [
                { email: 'user@example.com', name: 'John Smith', role: 'FROM' as const },
                { email: 'support@ourcompany.com', name: 'Support Team', role: 'TO' as const }
            ],
            tags: [
                { name: 'Support', color: '#ef4444' },
                { name: 'Resolved', color: '#10b981' },
                { name: 'Login Issue', color: '#f59e0b' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supportThread)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Support thread imported successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   Messages: ${result.importedMessages}`)
            console.log(`   Tags: ${result.thread.tags?.length || 0}`)
            console.log(`   Timeline events: ${result.timeline?.events?.length || 0}`)
        } else {
            console.log('❌ Failed to import support thread')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error importing support thread:', error)
    }

    console.log('\n')

    // Example 3: Import an EML file
    console.log('3️⃣ Example: Importing an EML file')
    console.log('─'.repeat(60))

    const emlFile = {
        source: 'email_file',
        data: {
            emlContent: `From: meeting@company.com
To: team@company.com
Subject: Weekly Team Meeting - Agenda
Date: ${new Date().toISOString()}
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h2>Weekly Team Meeting Agenda</h2>
<p>Hi team,</p>
<p>Here's the agenda for our weekly meeting tomorrow:</p>
<ul>
<li>Project status updates</li>
<li>New feature planning</li>
<li>Bug fixes discussion</li>
<li>Q&A session</li>
</ul>
<p>Please come prepared with your updates.</p>
<p>Best regards,<br>Meeting Coordinator</p>
</body>
</html>`,
            subject: 'Weekly Team Meeting - Agenda',
            from: 'meeting@company.com',
            to: 'team@company.com',
            timestamp: new Date().toISOString()
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emlFile)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ EML file imported successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   From: ${result.thread.participants[0]?.email}`)
            console.log(`   To: ${result.thread.participants[1]?.email}`)
        } else {
            console.log('❌ Failed to import EML file')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error importing EML file:', error)
    }

    console.log('\n')

    // Example 4: Import from Gmail API
    console.log('4️⃣ Example: Importing from Gmail API')
    console.log('─'.repeat(60))

    const gmailThread = {
        source: 'api_integration',
        data: {
            threadId: 'gmail_thread_789',
            subject: 'Project Budget Approval',
            messages: [
                {
                    messageId: 'gmail_msg_001',
                    from: 'finance@company.com',
                    to: ['manager@company.com'],
                    cc: ['accounting@company.com'],
                    bcc: [],
                    subject: 'Project Budget Approval',
                    body: `<p>Hi Manager,</p>
<p>I'm writing to confirm that the project budget has been approved for Q1.</p>
<p>Key details:</p>
<ul>
<li>Total budget: $50,000</li>
<li>Timeline: 3 months</li>
<li>Team size: 5 members</li>
</ul>
<p>Please let me know if you need any clarification.</p>
<p>Best regards,<br>Finance Team</p>`,
                    textBody: `Hi Manager,

I'm writing to confirm that the project budget has been approved for Q1.

Key details:
- Total budget: $50,000
- Timeline: 3 months
- Team size: 5 members

Please let me know if you need any clarification.

Best regards,
Finance Team`,
                    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                    isRead: true,
                    isForwarded: false,
                    isReplied: false
                }
            ],
            participants: [
                { email: 'finance@company.com', name: 'Finance Team', role: 'FROM' as const },
                { email: 'manager@company.com', name: 'Project Manager', role: 'TO' as const },
                { email: 'accounting@company.com', name: 'Accounting Team', role: 'CC' as const }
            ],
            tags: [
                { name: 'Budget', color: '#059669' },
                { name: 'Approved', color: '#10b981' },
                { name: 'Finance', color: '#3b82f6' }
            ]
        },
        options: { autoGenerateTimeline: true }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/email-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gmailThread)
        })

        const result = await response.json()

        if (response.ok) {
            console.log('✅ Gmail thread imported successfully!')
            console.log(`   Thread: "${result.thread.subject}"`)
            console.log(`   Thread ID: ${result.thread.threadId}`)
            console.log(`   Participants: ${result.thread.participants?.length || 0}`)
            console.log(`   Tags: ${result.thread.tags?.length || 0}`)
        } else {
            console.log('❌ Failed to import Gmail thread')
            console.log(`   Error: ${result.error}`)
        }
    } catch (error) {
        console.log('❌ Error importing Gmail thread:', error)
    }

    console.log('\n')

    // Summary
    console.log('📊 Summary')
    console.log('─'.repeat(60))

    try {
        const [threadsResponse, timelinesResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/email-threads`),
            fetch(`${API_BASE_URL}/timelines`)
        ])

        const threads = await threadsResponse.json()
        const timelines = await timelinesResponse.json()

        console.log(`Total email threads in database: ${threads.length}`)
        console.log(`Total timelines generated: ${timelines.length}`)

        // Show recent threads
        const recentThreads = threads.slice(0, 5)
        console.log('\nRecent email threads:')
        recentThreads.forEach((thread: any, index: number) => {
            console.log(`  ${index + 1}. "${thread.subject}" (${thread._count?.messages || 0} messages)`)
        })

    } catch (error) {
        console.log('❌ Error fetching summary:', error)
    }

    console.log('\n🎉 Manual email import testing complete!')
    console.log('\n💡 Tips:')
    console.log('  • Use the web interface at http://localhost:3000 to view imported threads')
    console.log('  • Try importing different types of emails to see how they appear')
    console.log('  • Check the timeline view to see automatically generated timelines')
    console.log('  • Use tags to organize and categorize your email threads')
}

// Run the manual tests
manualTestEmailImport().catch(console.error) 