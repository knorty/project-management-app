import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await prisma.timelineEvent.deleteMany()
    await prisma.timelineView.deleteMany()
    await prisma.emailAttachment.deleteMany()
    await prisma.emailMessage.deleteMany()
    await prisma.emailParticipant.deleteMany()
    await prisma.threadTag.deleteMany()
    await prisma.emailThread.deleteMany()
    await prisma.task.deleteMany()
    await prisma.projectStatus.deleteMany()
    await prisma.project.deleteMany()
    await prisma.user.deleteMany()

    console.log('🗑️  Cleared existing data')

    // Create sample users
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'john.doe@company.com',
                name: 'John Doe',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
            }
        }),
        prisma.user.create({
            data: {
                email: 'alice.smith@company.com',
                name: 'Alice Smith',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
            }
        }),
        prisma.user.create({
            data: {
                email: 'bob.wilson@company.com',
                name: 'Bob Wilson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
            }
        }),
        prisma.user.create({
            data: {
                email: 'sarah.johnson@company.com',
                name: 'Sarah Johnson',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
            }
        })
    ])

    console.log('👥 Created sample users')

    // Create sample projects
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: 'Q4 Product Launch',
                description: 'Launch of the new product features for Q4',
                status: 'ACTIVE',
                priority: 'HIGH',
                startDate: new Date('2024-10-01'),
                endDate: new Date('2024-12-31')
            }
        }),
        prisma.project.create({
            data: {
                name: 'Client Portal Redesign',
                description: 'Redesign of the client-facing portal',
                status: 'ACTIVE',
                priority: 'MEDIUM',
                startDate: new Date('2024-11-01'),
                endDate: new Date('2025-02-28')
            }
        })
    ])

    console.log('📋 Created sample projects')

    // Create project statuses
    const projectStatuses = await Promise.all([
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'Planning',
                description: 'Initial planning phase',
                color: '#3B82F6',
                order: 1
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'In Progress',
                description: 'Active development',
                color: '#F59E0B',
                order: 2
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'Review',
                description: 'Under review',
                color: '#8B5CF6',
                order: 3
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'Completed',
                description: 'Task completed',
                color: '#10B981',
                order: 4
            }
        })
    ])

    console.log('🏷️  Created project statuses')

    // Create sample email threads
    const emailThreads = await Promise.all([
        prisma.emailThread.create({
            data: {
                subject: 'Q4 Product Launch - Project Status Update',
                threadId: 'thread_q4_launch_001',
                projectId: projects[0].id,
                participants: {
                    create: [
                        { email: 'john.doe@company.com', name: 'John Doe', role: 'FROM' },
                        { email: 'alice.smith@company.com', name: 'Alice Smith', role: 'TO' },
                        { email: 'bob.wilson@company.com', name: 'Bob Wilson', role: 'CC' },
                        { email: 'sarah.johnson@company.com', name: 'Sarah Johnson', role: 'CC' }
                    ]
                },
                tags: {
                    create: [
                        { name: 'urgent', color: '#EF4444' },
                        { name: 'project', color: '#3B82F6' },
                        { name: 'q4', color: '#10B981' }
                    ]
                }
            }
        }),
        prisma.emailThread.create({
            data: {
                subject: 'Client Feedback - Portal Redesign Discussion',
                threadId: 'thread_portal_feedback_002',
                projectId: projects[1].id,
                participants: {
                    create: [
                        { email: 'alice.smith@company.com', name: 'Alice Smith', role: 'FROM' },
                        { email: 'john.doe@company.com', name: 'John Doe', role: 'TO' },
                        { email: 'bob.wilson@company.com', name: 'Bob Wilson', role: 'TO' }
                    ]
                },
                tags: {
                    create: [
                        { name: 'feedback', color: '#8B5CF6' },
                        { name: 'client', color: '#F59E0B' },
                        { name: 'design', color: '#06B6D4' }
                    ]
                }
            }
        }),
        prisma.emailThread.create({
            data: {
                subject: 'Weekly Team Standup - Development Updates',
                threadId: 'thread_standup_003',
                participants: {
                    create: [
                        { email: 'bob.wilson@company.com', name: 'Bob Wilson', role: 'FROM' },
                        { email: 'john.doe@company.com', name: 'John Doe', role: 'TO' },
                        { email: 'alice.smith@company.com', name: 'Alice Smith', role: 'TO' },
                        { email: 'sarah.johnson@company.com', name: 'Sarah Johnson', role: 'TO' }
                    ]
                },
                tags: {
                    create: [
                        { name: 'standup', color: '#10B981' },
                        { name: 'weekly', color: '#6B7280' }
                    ]
                }
            }
        })
    ])

    console.log('📧 Created sample email threads')

    // Create sample email messages for the first thread
    const message1 = await prisma.emailMessage.create({
        data: {
            messageId: 'msg_q4_launch_001',
            threadId: emailThreads[0].id,
            from: 'john.doe@company.com',
            to: ['alice.smith@company.com'],
            cc: ['bob.wilson@company.com', 'sarah.johnson@company.com'],
            bcc: [],
            subject: 'Q4 Product Launch - Project Status Update',
            body: '<p>Hi team,</p><p>I wanted to provide an update on our Q4 product launch progress. We\'ve made significant strides in the development phase and are currently on track to meet our December deadline.</p><p>Key highlights:</p><ul><li>Core features are 80% complete</li><li>Testing phase begins next week</li><li>Marketing materials are being prepared</li></ul><p>Please review the attached project timeline and let me know if you have any questions.</p><p>Best regards,<br>John</p>',
            textBody: 'Hi team, I wanted to provide an update on our Q4 product launch progress. We\'ve made significant strides in the development phase and are currently on track to meet our December deadline. Key highlights: Core features are 80% complete, Testing phase begins next week, Marketing materials are being prepared. Please review the attached project timeline and let me know if you have any questions. Best regards, John',
            timestamp: new Date('2024-11-15T10:00:00Z'),
            isRead: true,
            isForwarded: false,
            isReplied: false
        }
    })

    const message2 = await prisma.emailMessage.create({
        data: {
            messageId: 'msg_q4_launch_002',
            threadId: emailThreads[0].id,
            from: 'alice.smith@company.com',
            to: ['john.doe@company.com'],
            cc: ['bob.wilson@company.com', 'sarah.johnson@company.com'],
            bcc: [],
            subject: 'Re: Q4 Product Launch - Project Status Update',
            body: '<p>Thanks for the update, John!</p><p>The progress looks great. I have a few questions about the testing timeline:</p><ul><li>Will we have enough time for user acceptance testing?</li><li>Are we planning to do a beta release?</li></ul><p>Also, I\'ve attached the updated marketing requirements document.</p><p>Best,<br>Alice</p>',
            textBody: 'Thanks for the update, John! The progress looks great. I have a few questions about the testing timeline: Will we have enough time for user acceptance testing? Are we planning to do a beta release? Also, I\'ve attached the updated marketing requirements document. Best, Alice',
            timestamp: new Date('2024-11-15T14:30:00Z'),
            isRead: true,
            isForwarded: false,
            isReplied: true,
            parentMessageId: message1.id,
            attachments: {
                create: [
                    {
                        filename: 'marketing_requirements_v2.pdf',
                        contentType: 'application/pdf',
                        size: 2048576,
                        url: 'https://example.com/files/marketing_requirements_v2.pdf'
                    }
                ]
            }
        }
    })

    const message3 = await prisma.emailMessage.create({
        data: {
            messageId: 'msg_q4_launch_003',
            threadId: emailThreads[0].id,
            from: 'john.doe@company.com',
            to: ['alice.smith@company.com'],
            cc: ['bob.wilson@company.com', 'sarah.johnson@company.com'],
            bcc: [],
            subject: 'Re: Q4 Product Launch - Project Status Update',
            body: '<p>Great questions, Alice!</p><p>Yes, we\'ve allocated 2 weeks for UAT, which should be sufficient. And yes, we\'re planning a beta release to select customers in the first week of December.</p><p>I\'ve reviewed the marketing requirements - they look comprehensive. Bob, can you confirm the technical requirements are aligned?</p><p>Thanks,<br>John</p>',
            textBody: 'Great questions, Alice! Yes, we\'ve allocated 2 weeks for UAT, which should be sufficient. And yes, we\'re planning a beta release to select customers in the first week of December. I\'ve reviewed the marketing requirements - they look comprehensive. Bob, can you confirm the technical requirements are aligned? Thanks, John',
            timestamp: new Date('2024-11-15T16:45:00Z'),
            isRead: true,
            isForwarded: false,
            isReplied: true,
            parentMessageId: message2.id
        }
    })

    const messages1 = [message1, message2, message3]

    // Create sample email messages for the second thread
    const message4 = await prisma.emailMessage.create({
        data: {
            messageId: 'msg_portal_feedback_001',
            threadId: emailThreads[1].id,
            from: 'alice.smith@company.com',
            to: ['john.doe@company.com', 'bob.wilson@company.com'],
            cc: [],
            bcc: [],
            subject: 'Client Feedback - Portal Redesign Discussion',
            body: '<p>Hi John and Bob,</p><p>I just received feedback from our key client about the portal redesign. They\'re very impressed with the new interface but have some suggestions for the dashboard layout.</p><p>Key feedback points:</p><ul><li>Dashboard needs more customization options</li><li>Mobile responsiveness is excellent</li><li>Would like to see more data visualization options</li></ul><p>I\'ve attached their detailed feedback document.</p><p>Best,<br>Alice</p>',
            textBody: 'Hi John and Bob, I just received feedback from our key client about the portal redesign. They\'re very impressed with the new interface but have some suggestions for the dashboard layout. Key feedback points: Dashboard needs more customization options, Mobile responsiveness is excellent, Would like to see more data visualization options. I\'ve attached their detailed feedback document. Best, Alice',
            timestamp: new Date('2024-11-14T09:15:00Z'),
            isRead: true,
            isForwarded: false,
            isReplied: false,
            attachments: {
                create: [
                    {
                        filename: 'client_feedback_portal.pdf',
                        contentType: 'application/pdf',
                        size: 1536000,
                        url: 'https://example.com/files/client_feedback_portal.pdf'
                    }
                ]
            }
        }
    })

    const message5 = await prisma.emailMessage.create({
        data: {
            messageId: 'msg_portal_feedback_002',
            threadId: emailThreads[1].id,
            from: 'bob.wilson@company.com',
            to: ['alice.smith@company.com', 'john.doe@company.com'],
            cc: [],
            bcc: [],
            subject: 'Re: Client Feedback - Portal Redesign Discussion',
            body: '<p>Thanks for sharing this, Alice!</p><p>The feedback is very valuable. I think we can definitely implement the customization options and data visualization features they\'re requesting.</p><p>I\'ll create a technical specification document for these new features and share it with the team.</p><p>Bob</p>',
            textBody: 'Thanks for sharing this, Alice! The feedback is very valuable. I think we can definitely implement the customization options and data visualization features they\'re requesting. I\'ll create a technical specification document for these new features and share it with the team. Bob',
            timestamp: new Date('2024-11-14T11:30:00Z'),
            isRead: true,
            isForwarded: false,
            isReplied: true,
            parentMessageId: message4.id
        }
    })

    const messages2 = [message4, message5]

    console.log('💬 Created sample email messages')

    // Create timeline views
    const timelineViews = await Promise.all([
        prisma.timelineView.create({
            data: {
                threadId: emailThreads[0].id,
                title: 'Q4 Launch Project Timeline',
                description: 'Visual timeline of the Q4 product launch discussion',
                isPublic: true
            }
        }),
        prisma.timelineView.create({
            data: {
                threadId: emailThreads[1].id,
                title: 'Portal Redesign Feedback Timeline',
                description: 'Timeline of client feedback and responses',
                isPublic: false
            }
        })
    ])

    console.log('📊 Created timeline views')

    // Create timeline events
    const timelineEvents = await Promise.all([
        // Events for Q4 Launch timeline
        prisma.timelineEvent.create({
            data: {
                timelineId: timelineViews[0].id,
                messageId: messages1[0].id,
                eventType: 'EMAIL_RECEIVED',
                title: 'Project Status Update Sent',
                description: 'John sent the initial project status update to the team',
                timestamp: new Date('2024-11-15T10:00:00Z'),
                order: 1,
                metadata: { sender: 'John Doe', recipients: 4 }
            }
        }),
        prisma.timelineEvent.create({
            data: {
                timelineId: timelineViews[0].id,
                messageId: messages1[1].id,
                eventType: 'EMAIL_REPLIED',
                title: 'Alice Responded with Questions',
                description: 'Alice replied with questions about testing timeline and attached marketing requirements',
                timestamp: new Date('2024-11-15T14:30:00Z'),
                order: 2,
                metadata: { sender: 'Alice Smith', attachments: 1 }
            }
        }),
        prisma.timelineEvent.create({
            data: {
                timelineId: timelineViews[0].id,
                messageId: messages1[2].id,
                eventType: 'EMAIL_REPLIED',
                title: 'John Provided Answers',
                description: 'John answered Alice\'s questions about UAT and beta release plans',
                timestamp: new Date('2024-11-15T16:45:00Z'),
                order: 3,
                metadata: { sender: 'John Doe', confirmedUAT: true, confirmedBeta: true }
            }
        }),
        // Events for Portal Feedback timeline
        prisma.timelineEvent.create({
            data: {
                timelineId: timelineViews[1].id,
                messageId: messages2[0].id,
                eventType: 'EMAIL_RECEIVED',
                title: 'Client Feedback Received',
                description: 'Alice shared client feedback about portal redesign',
                timestamp: new Date('2024-11-14T09:15:00Z'),
                order: 1,
                metadata: { sender: 'Alice Smith', feedbackType: 'positive', attachments: 1 }
            }
        }),
        prisma.timelineEvent.create({
            data: {
                timelineId: timelineViews[1].id,
                messageId: messages2[1].id,
                eventType: 'EMAIL_REPLIED',
                title: 'Bob Acknowledged Feedback',
                description: 'Bob acknowledged the feedback and committed to creating technical specifications',
                timestamp: new Date('2024-11-14T11:30:00Z'),
                order: 2,
                metadata: { sender: 'Bob Wilson', actionRequired: 'technical_specs' }
            }
        })
    ])

    console.log('📅 Created timeline events')

    // Create sample tasks
    const tasks = await Promise.all([
        prisma.task.create({
            data: {
                title: 'Complete Core Features Development',
                description: 'Finish the remaining 20% of core features for Q4 launch',
                projectId: projects[0].id,
                statusId: projectStatuses[1].id, // In Progress
                priority: 'HIGH',
                dueDate: new Date('2024-11-30'),
                assignedTo: 'bob.wilson@company.com'
            }
        }),
        prisma.task.create({
            data: {
                title: 'Prepare Marketing Materials',
                description: 'Create marketing materials for the Q4 product launch',
                projectId: projects[0].id,
                statusId: projectStatuses[0].id, // Planning
                priority: 'MEDIUM',
                dueDate: new Date('2024-12-15'),
                assignedTo: 'alice.smith@company.com'
            }
        }),
        prisma.task.create({
            data: {
                title: 'Implement Dashboard Customization',
                description: 'Add customization options to the portal dashboard based on client feedback',
                projectId: projects[1].id,
                statusId: projectStatuses[0].id, // Planning
                priority: 'HIGH',
                dueDate: new Date('2025-01-15'),
                assignedTo: 'bob.wilson@company.com'
            }
        })
    ])

    console.log('✅ Created sample tasks')

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Created:`)
    console.log(`   - ${users.length} users`)
    console.log(`   - ${projects.length} projects`)
    console.log(`   - ${projectStatuses.length} project statuses`)
    console.log(`   - ${emailThreads.length} email threads`)
    console.log(`   - ${messages1.length + messages2.length} email messages`)
    console.log(`   - ${timelineViews.length} timeline views`)
    console.log(`   - ${timelineEvents.length} timeline events`)
    console.log(`   - ${tasks.length} tasks`)
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 