import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType } from '@prisma/client'

// Types for email import
interface EmailImportData {
    subject: string
    threadId?: string
    messages: EmailMessageData[]
    participants?: EmailParticipantData[]
    tags?: EmailTagData[]
    projectId?: string
}

interface EmailMessageData {
    messageId: string
    from: string
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    body: string
    textBody?: string
    timestamp: string
    isRead?: boolean
    isForwarded?: boolean
    isReplied?: boolean
    parentMessageId?: string
    attachments?: EmailAttachmentData[]
}

interface EmailParticipantData {
    email: string
    name?: string
    role: 'FROM' | 'TO' | 'CC' | 'BCC'
}

interface EmailTagData {
    name: string
    color?: string
}

interface EmailAttachmentData {
    filename: string
    contentType: string
    size: number
    url?: string
    data?: string // Base64 encoded data
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { source, data, options = {} } = body

        let emailData: EmailImportData

        // Handle different import sources
        switch (source) {
            case 'forwarded_email':
                emailData = parseForwardedEmail(data)
                break
            case 'email_file':
                emailData = parseEmailFile(data)
                break
            case 'api_integration':
                emailData = parseApiIntegration(data)
                break
            case 'manual':
                // For manual entry, create participants from the message data
                const participants = []
                const seenEmails = new Set()

                for (const message of data.messages) {
                    // Add FROM participant
                    if (message.from && !seenEmails.has(message.from)) {
                        participants.push({ email: message.from, role: 'FROM' as const })
                        seenEmails.add(message.from)
                    }

                    // Add TO participants
                    if (message.to) {
                        const toEmails = Array.isArray(message.to) ? message.to : [message.to]
                        for (const email of toEmails) {
                            if (email && !seenEmails.has(email)) {
                                participants.push({ email, role: 'TO' as const })
                                seenEmails.add(email)
                            }
                        }
                    }

                    // Add CC participants
                    if (message.cc) {
                        const ccEmails = Array.isArray(message.cc) ? message.cc : [message.cc]
                        for (const email of ccEmails) {
                            if (email && !seenEmails.has(email)) {
                                participants.push({ email, role: 'CC' as const })
                                seenEmails.add(email)
                            }
                        }
                    }

                    // Add BCC participants
                    if (message.bcc) {
                        const bccEmails = Array.isArray(message.bcc) ? message.bcc : [message.bcc]
                        for (const email of bccEmails) {
                            if (email && !seenEmails.has(email)) {
                                participants.push({ email, role: 'BCC' as const })
                                seenEmails.add(email)
                            }
                        }
                    }
                }

                emailData = {
                    ...data,
                    participants
                }
                break
            default:
                return NextResponse.json(
                    { error: 'Unsupported import source' },
                    { status: 400 }
                )
        }

        // Validate the email data
        const validationResult = validateEmailData(emailData)
        if (!validationResult.valid) {
            return NextResponse.json(
                { error: 'Invalid email data', details: validationResult.errors },
                { status: 400 }
            )
        }

        // Check if thread already exists (by threadId or by content similarity)
        let existingThread = null

        if (emailData.threadId) {
            existingThread = await prisma.emailThread.findUnique({
                where: { threadId: emailData.threadId }
            })
        }

        // If no threadId match, check for similar content (same subject and participants)
        if (!existingThread && !options.allowDuplicate) {
            const similarThread = await prisma.emailThread.findFirst({
                where: {
                    subject: emailData.subject,
                    participants: {
                        some: {
                            email: {
                                in: emailData.participants?.map(p => p.email) || []
                            }
                        }
                    }
                },
                include: {
                    participants: true
                }
            })

            if (similarThread) {
                // Check if it's really the same thread by comparing participants
                const existingEmails = similarThread.participants.map(p => p.email)
                const newEmails = emailData.participants?.map(p => p.email) || []
                const emailOverlap = existingEmails.filter(email => newEmails.includes(email))

                if (emailOverlap.length >= Math.min(existingEmails.length, newEmails.length) * 0.7) {
                    existingThread = similarThread
                }
            }
        }

        if (existingThread && !options.allowDuplicate) {
            return NextResponse.json(
                { error: 'Email thread already exists', threadId: existingThread.id },
                { status: 409 }
            )
        }

        // Process participants and create/link users
        const processedParticipants = []
        if (emailData.participants) {
            for (const participant of emailData.participants) {
                try {
                    // Find or create user
                    let user = await prisma.user.findUnique({
                        where: { email: participant.email }
                    })

                    if (!user) {
                        // Create new user
                        user = await prisma.user.create({
                            data: {
                                email: participant.email,
                                name: participant.name || participant.email.split('@')[0]
                            }
                        })
                        console.log(`Created new user: ${user.email} (${user.name})`)
                    } else if (participant.name && user.name !== participant.name) {
                        // Update user name if provided and different
                        user = await prisma.user.update({
                            where: { email: participant.email },
                            data: { name: participant.name }
                        })
                        console.log(`Updated user: ${user.email} -> ${user.name}`)
                    } else {
                        console.log(`Found existing user: ${user.email} (${user.name})`)
                    }

                    processedParticipants.push({
                        email: participant.email,
                        name: participant.name || user.name,
                        role: participant.role,
                        userId: user.id
                    })
                } catch (error) {
                    console.error(`Error processing participant ${participant.email}:`, error)
                    // Fallback: create participant without user link
                    processedParticipants.push({
                        email: participant.email,
                        name: participant.name,
                        role: participant.role,
                        userId: null
                    })
                }
            }
        }

        // Create or update the email thread
        const emailThread = await prisma.emailThread.upsert({
            where: {
                threadId: emailData.threadId || `imported_${Date.now()}`
            },
            update: {
                subject: emailData.subject,
                participants: {
                    deleteMany: {},
                    create: processedParticipants.map(p => ({
                        email: p.email,
                        name: p.name,
                        role: p.role,
                        userId: p.userId
                    }))
                },
                tags: {
                    deleteMany: {},
                    create: emailData.tags?.map(t => ({
                        name: t.name,
                        color: t.color
                    })) || []
                }
            },
            create: {
                subject: emailData.subject,
                threadId: emailData.threadId || `imported_${Date.now()}`,
                projectId: emailData.projectId,
                participants: {
                    create: processedParticipants.map(p => ({
                        email: p.email,
                        name: p.name,
                        role: p.role,
                        userId: p.userId
                    }))
                },
                tags: {
                    create: emailData.tags?.map(t => ({
                        name: t.name,
                        color: t.color
                    })) || []
                }
            },
            include: {
                participants: true,
                tags: true
            }
        })

        // Create email messages
        const createdMessages = []
        const messageMap = new Map<string, string>() // messageId -> databaseId

        for (const messageData of emailData.messages) {
            const message = await prisma.emailMessage.create({
                data: {
                    messageId: messageData.messageId,
                    threadId: emailThread.id,
                    from: messageData.from,
                    to: messageData.to,
                    cc: messageData.cc || [],
                    bcc: messageData.bcc || [],
                    subject: messageData.subject,
                    body: messageData.body,
                    textBody: messageData.textBody,
                    timestamp: new Date(messageData.timestamp),
                    isRead: messageData.isRead ?? false,
                    isForwarded: messageData.isForwarded ?? false,
                    isReplied: messageData.isReplied ?? false,
                    attachments: {
                        create: messageData.attachments?.map(att => ({
                            filename: att.filename,
                            contentType: att.contentType,
                            size: att.size,
                            url: att.url
                        })) || []
                    }
                },
                include: {
                    attachments: true
                }
            })

            messageMap.set(messageData.messageId, message.id)
            createdMessages.push(message)
        }

        // Update parent message references
        for (let i = 0; i < emailData.messages.length; i++) {
            const messageData = emailData.messages[i]
            if (messageData.parentMessageId && messageMap.has(messageData.parentMessageId)) {
                await prisma.emailMessage.update({
                    where: { id: messageMap.get(messageData.messageId)! },
                    data: { parentMessageId: messageMap.get(messageData.parentMessageId)! }
                })
            }
        }

        // Auto-generate timeline if requested
        let timeline = null
        if (options.autoGenerateTimeline) {
            timeline = await generateTimelineFromThread(emailThread.id)
        }

        return NextResponse.json({
            success: true,
            message: 'Email thread imported successfully',
            thread: {
                ...emailThread,
                messages: createdMessages,
                _count: {
                    messages: createdMessages.length
                }
            },
            timeline,
            importedMessages: createdMessages.length
        }, { status: 201 })

    } catch (error) {
        console.error('Error importing email:', error)
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json(
            { error: 'Failed to import email thread', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

// Helper functions for parsing different email formats
function parseForwardedEmail(data: any): EmailImportData {
    // Parse forwarded email format (common in email clients)
    const { subject, from, to, cc, bcc, body, textBody, timestamp, attachments = [] } = data

    // Create a more stable threadId based on content hash
    const contentHash = Buffer.from(`${subject}-${from}-${Array.isArray(to) ? to.join(',') : to}`).toString('base64').slice(0, 16)
    const threadId = `forwarded_${contentHash}`

    return {
        subject: subject || 'Forwarded Email',
        threadId,
        messages: [{
            messageId: `forwarded_msg_${Date.now()}`,
            from,
            to: Array.isArray(to) ? to : [to],
            cc: Array.isArray(cc) ? cc : cc ? [cc] : [],
            bcc: Array.isArray(bcc) ? bcc : bcc ? [bcc] : [],
            subject,
            body,
            textBody,
            timestamp: timestamp || new Date().toISOString(),
            isForwarded: true,
            attachments: attachments.map((att: any, index: number) => ({
                filename: att.filename || `attachment_${index + 1}`,
                contentType: att.contentType || 'application/octet-stream',
                size: att.size || 0,
                url: att.url
            }))
        }],
        participants: [
            { email: from, role: 'FROM' as const },
            ...(Array.isArray(to) ? to : [to]).map((email: string) => ({ email, role: 'TO' as const })),
            ...(Array.isArray(cc) ? cc : cc ? [cc] : []).map((email: string) => ({ email, role: 'CC' as const })),
            ...(Array.isArray(bcc) ? bcc : bcc ? [bcc] : []).map((email: string) => ({ email, role: 'BCC' as const }))
        ]
    }
}

function parseEmailFile(data: any): EmailImportData {
    // Parse email file format (EML, MSG, etc.)
    const { emlContent, msgContent, ...metadata } = data

    // Handle to field properly - it could be a string or array
    const toEmails = Array.isArray(metadata.to) ? metadata.to : metadata.to ? [metadata.to] : ['unknown@example.com']

    // This is a simplified parser - in production you'd use proper email parsing libraries
    return {
        subject: metadata.subject || 'Imported Email',
        threadId: `file_import_${Date.now()}`,
        messages: [{
            messageId: `file_msg_${Date.now()}`,
            from: metadata.from || 'unknown@example.com',
            to: toEmails,
            cc: metadata.cc || [],
            bcc: metadata.bcc || [],
            subject: metadata.subject || 'Imported Email',
            body: emlContent || msgContent || metadata.body || '',
            textBody: metadata.textBody,
            timestamp: metadata.timestamp || new Date().toISOString(),
            attachments: metadata.attachments || []
        }],
        participants: [
            { email: metadata.from || 'unknown@example.com', role: 'FROM' as const },
            ...toEmails.map((email: string) => ({ email, role: 'TO' as const }))
        ]
    }
}

function parseApiIntegration(data: any): EmailImportData {
    // Parse API integration format (Gmail, Outlook, etc.)
    const { messages, threadId, subject, participants, ...metadata } = data

    return {
        subject: subject || 'API Imported Email',
        threadId: threadId || `api_import_${Date.now()}`,
        messages: messages.map((msg: any, index: number) => ({
            messageId: msg.messageId || `api_msg_${Date.now()}_${index}`,
            from: msg.from,
            to: msg.to || [],
            cc: msg.cc || [],
            bcc: msg.bcc || [],
            subject: msg.subject,
            body: msg.body,
            textBody: msg.textBody,
            timestamp: msg.timestamp || new Date().toISOString(),
            isRead: msg.isRead,
            isForwarded: msg.isForwarded,
            isReplied: msg.isReplied,
            parentMessageId: msg.parentMessageId,
            attachments: msg.attachments || []
        })),
        participants: participants || [],
        tags: metadata.tags || []
    }
}

function validateEmailData(data: EmailImportData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.subject) {
        errors.push('Subject is required')
    }

    if (!data.messages || data.messages.length === 0) {
        errors.push('At least one message is required')
    }

    for (const message of data.messages) {
        if (!message.from) {
            errors.push('Message from field is required')
        }
        if (!message.to || message.to.length === 0) {
            errors.push('Message to field is required')
        }
        if (!message.subject) {
            errors.push('Message subject is required')
        }
        if (!message.body) {
            errors.push('Message body is required')
        }
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

async function generateTimelineFromThread(threadId: string) {
    try {
        const thread = await prisma.emailThread.findUnique({
            where: { id: threadId },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        attachments: true,
                        replies: {
                            include: { attachments: true }
                        }
                    }
                }
            }
        })

        if (!thread) return null

        // Check if timeline already exists
        const existingTimeline = await prisma.timelineView.findUnique({
            where: { threadId }
        })

        if (existingTimeline) return existingTimeline

        // Generate timeline events
        const timelineEvents = thread.messages.map((message, index) => {
            let eventType: EventType = EventType.EMAIL_RECEIVED
            let eventTitle = 'Email Received'
            let eventDescription = `Email from ${message.from}`

            if (message.isReplied) {
                eventType = EventType.EMAIL_REPLIED
                eventTitle = 'Email Reply'
                eventDescription = `Reply from ${message.from}`
            } else if (message.isForwarded) {
                eventType = EventType.EMAIL_FORWARDED
                eventTitle = 'Email Forwarded'
                eventDescription = `Forwarded by ${message.from}`
            }

            if (message.attachments.length > 0) {
                eventDescription += ` (${message.attachments.length} attachment${message.attachments.length > 1 ? 's' : ''})`
            }

            if (message.replies.length > 0) {
                eventDescription += ` (${message.replies.length} reply${message.replies.length > 1 ? 'ies' : 'y'})`
            }

            return {
                messageId: message.id,
                eventType,
                title: eventTitle,
                description: eventDescription,
                timestamp: message.timestamp,
                order: index + 1,
                metadata: {
                    sender: message.from,
                    recipients: [...message.to, ...message.cc],
                    hasAttachments: message.attachments.length > 0,
                    attachmentCount: message.attachments.length,
                    replyCount: message.replies.length,
                    isRead: message.isRead
                }
            }
        })

        // Create timeline
        const timeline = await prisma.timelineView.create({
            data: {
                threadId,
                title: `${thread.subject} Timeline`,
                description: `Automatically generated timeline for ${thread.subject}`,
                isPublic: false,
                events: {
                    create: timelineEvents
                }
            },
            include: {
                events: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return timeline
    } catch (error) {
        console.error('Error generating timeline:', error)
        return null
    }
} 