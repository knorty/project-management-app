import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createMultiReplyThread() {
    try {
        console.log('Creating multi-reply email thread...')

        // Create or find users
        const manager = await prisma.user.upsert({
            where: { email: 'manager@test.com' },
            update: { name: 'Project Manager' },
            create: { email: 'manager@test.com', name: 'Project Manager' }
        })

        const developer = await prisma.user.upsert({
            where: { email: 'dev@test.com' },
            update: { name: 'Developer' },
            create: { email: 'dev@test.com', name: 'Developer' }
        })

        const designer = await prisma.user.upsert({
            where: { email: 'designer@test.com' },
            update: { name: 'Designer' },
            create: { email: 'designer@test.com', name: 'Designer' }
        })

        // Create the email thread
        const thread = await prisma.emailThread.create({
            data: {
                subject: 'Multi-Reply Test Thread',
                threadId: `multi_reply_test_${Date.now()}`,
                participants: {
                    create: [
                        {
                            email: 'manager@test.com',
                            name: 'Project Manager',
                            role: 'FROM',
                            userId: manager.id
                        },
                        {
                            email: 'dev@test.com',
                            name: 'Developer',
                            role: 'TO',
                            userId: developer.id
                        },
                        {
                            email: 'designer@test.com',
                            name: 'Designer',
                            role: 'TO',
                            userId: designer.id
                        }
                    ]
                },
                tags: {
                    create: [
                        { name: 'Multi-Reply Test', color: '#3b82f6' },
                        { name: 'Project Discussion', color: '#10b981' }
                    ]
                }
            }
        })

        console.log('Created thread:', thread.id)

        const timestamp = Date.now()
        // Create multiple messages with replies
        const messages = [
            {
                messageId: `multi_001_${timestamp}`,
                from: 'manager@test.com',
                to: ['dev@test.com', 'designer@test.com'],
                cc: [],
                bcc: [],
                subject: 'Multi-Reply Test Thread',
                body: '<p>Hi team,</p><p>This is the initial message for our multi-reply test.</p><p>Please respond with your thoughts on the new project proposal.</p><p>Key points to discuss:</p><ul><li>Technical feasibility</li><li>Timeline estimates</li><li>Resource requirements</li></ul><p>Best regards,<br>Project Manager</p>',
                textBody: 'Hi team,\n\nThis is the initial message for our multi-reply test.\n\nPlease respond with your thoughts on the new project proposal.\n\nKey points to discuss:\n- Technical feasibility\n- Timeline estimates\n- Resource requirements\n\nBest regards,\nProject Manager',
                timestamp: new Date('2025-07-28T09:00:00.000Z'),
                isRead: false,
                isForwarded: false,
                isReplied: false
            },
            {
                messageId: `multi_002_${timestamp}`,
                from: 'dev@test.com',
                to: ['manager@test.com'],
                cc: ['designer@test.com'],
                bcc: [],
                subject: 'Re: Multi-Reply Test Thread',
                body: '<p>Hi Manager,</p><p>Thanks for the proposal! I think this is technically feasible.</p><p>My initial assessment:</p><ul><li>Technical feasibility: High - we have the required skills</li><li>Timeline: 3-4 months for full implementation</li><li>Resources: Need 2 developers + 1 designer</li></ul><p>I can start working on the technical architecture next week.</p><p>Best,<br>Developer</p>',
                textBody: 'Hi Manager,\n\nThanks for the proposal! I think this is technically feasible.\n\nMy initial assessment:\n- Technical feasibility: High - we have the required skills\n- Timeline: 3-4 months for full implementation\n- Resources: Need 2 developers + 1 designer\n\nI can start working on the technical architecture next week.\n\nBest,\nDeveloper',
                timestamp: new Date('2025-07-28T10:30:00.000Z'),
                isRead: true,
                isForwarded: false,
                isReplied: true
            },
            {
                messageId: `multi_003_${timestamp}`,
                from: 'designer@test.com',
                to: ['manager@test.com'],
                cc: ['dev@test.com'],
                bcc: [],
                subject: 'Re: Multi-Reply Test Thread',
                body: '<p>Hi Manager,</p><p>I agree with the developer\'s assessment. This looks promising!</p><p>Design considerations:</p><ul><li>User experience: Need to focus on intuitive navigation</li><li>Mobile responsiveness: Critical for user adoption</li><li>Accessibility: Must meet WCAG 2.1 standards</li></ul><p>I\'ll prepare some initial mockups for review.</p><p>Cheers,<br>Designer</p>',
                textBody: 'Hi Manager,\n\nI agree with the developer\'s assessment. This looks promising!\n\nDesign considerations:\n- User experience: Need to focus on intuitive navigation\n- Mobile responsiveness: Critical for user adoption\n- Accessibility: Must meet WCAG 2.1 standards\n\nI\'ll prepare some initial mockups for review.\n\nCheers,\nDesigner',
                timestamp: new Date('2025-07-28T11:15:00.000Z'),
                isRead: true,
                isForwarded: false,
                isReplied: true
            },
            {
                messageId: `multi_004_${timestamp}`,
                from: 'manager@test.com',
                to: ['dev@test.com', 'designer@test.com'],
                cc: [],
                bcc: [],
                subject: 'Re: Multi-Reply Test Thread',
                body: '<p>Excellent! Thanks for the quick responses.</p><p>Based on your feedback, I\'m confident we can move forward.</p><p>Next steps:</p><ol><li>Schedule kickoff meeting for next week</li><li>Developer to prepare technical architecture</li><li>Designer to create initial mockups</li><li>Project planning session</li></ol><p>Meeting link will be sent tomorrow.</p><p>Looking forward to a great collaboration!</p><p>Best regards,<br>Project Manager</p>',
                textBody: 'Excellent! Thanks for the quick responses.\n\nBased on your feedback, I\'m confident we can move forward.\n\nNext steps:\n1. Schedule kickoff meeting for next week\n2. Developer to prepare technical architecture\n3. Designer to create initial mockups\n4. Project planning session\n\nMeeting link will be sent tomorrow.\n\nLooking forward to a great collaboration!\n\nBest regards,\nProject Manager',
                timestamp: new Date('2025-07-28T14:00:00.000Z'),
                isRead: false,
                isForwarded: false,
                isReplied: true
            }
        ]

        // Create messages and store their IDs
        const createdMessages = []
        for (const messageData of messages) {
            const message = await prisma.emailMessage.create({
                data: {
                    ...messageData,
                    threadId: thread.id
                }
            })
            createdMessages.push(message)
        }

        console.log('Created', createdMessages.length, 'messages')

        // Generate timeline
        const timeline = await prisma.timelineView.create({
            data: {
                threadId: thread.id,
                title: 'Multi-Reply Test Thread Timeline',
                description: 'Timeline showing a multi-reply email conversation',
                isPublic: false,
                events: {
                    create: [
                        {
                            messageId: createdMessages[0].id,
                            eventType: 'EMAIL_RECEIVED',
                            title: 'Initial Project Proposal',
                            description: 'Project Manager sent the initial project proposal to the team',
                            timestamp: new Date('2025-07-28T09:00:00.000Z'),
                            order: 1,
                            metadata: {
                                sender: 'manager@test.com',
                                recipients: ['dev@test.com', 'designer@test.com'],
                                replyCount: 2,
                                hasAttachments: false,
                                attachmentCount: 0
                            }
                        },
                        {
                            messageId: createdMessages[1].id,
                            eventType: 'EMAIL_REPLIED',
                            title: 'Developer Response',
                            description: 'Developer provided technical assessment and timeline estimates',
                            timestamp: new Date('2025-07-28T10:30:00.000Z'),
                            order: 2,
                            metadata: {
                                sender: 'dev@test.com',
                                recipients: ['manager@test.com'],
                                replyCount: 1,
                                hasAttachments: false,
                                attachmentCount: 0
                            }
                        },
                        {
                            messageId: createdMessages[2].id,
                            eventType: 'EMAIL_REPLIED',
                            title: 'Designer Response',
                            description: 'Designer agreed with assessment and outlined design considerations',
                            timestamp: new Date('2025-07-28T11:15:00.000Z'),
                            order: 3,
                            metadata: {
                                sender: 'designer@test.com',
                                recipients: ['manager@test.com'],
                                replyCount: 1,
                                hasAttachments: false,
                                attachmentCount: 0
                            }
                        },
                        {
                            messageId: createdMessages[3].id,
                            eventType: 'EMAIL_REPLIED',
                            title: 'Project Approval',
                            description: 'Project Manager approved the project and outlined next steps',
                            timestamp: new Date('2025-07-28T14:00:00.000Z'),
                            order: 4,
                            metadata: {
                                sender: 'manager@test.com',
                                recipients: ['dev@test.com', 'designer@test.com'],
                                replyCount: 0,
                                hasAttachments: false,
                                attachmentCount: 0
                            }
                        }
                    ]
                }
            }
        })

        console.log('Created timeline:', timeline.id)
        console.log('Multi-reply thread created successfully!')
        console.log('Thread ID:', thread.id)
        console.log('Timeline ID:', timeline.id)

    } catch (error) {
        console.error('Error creating multi-reply thread:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createMultiReplyThread() 