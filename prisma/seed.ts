import { PrismaClient, UserRole, ProjectRole, ProjectState, Priority } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Create users
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'alice@example.com',
                name: 'Alice Johnson',
                password: hashedPassword,
                role: UserRole.ADMIN,
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
            }
        }),
        prisma.user.create({
            data: {
                email: 'bob@example.com',
                name: 'Bob Smith',
                password: hashedPassword,
                role: UserRole.MANAGER,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            }
        }),
        prisma.user.create({
            data: {
                email: 'carol@example.com',
                name: 'Carol Davis',
                password: hashedPassword,
                role: UserRole.MEMBER,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            }
        }),
        prisma.user.create({
            data: {
                email: 'dave@example.com',
                name: 'Dave Wilson',
                password: hashedPassword,
                role: UserRole.MEMBER,
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
        })
    ])

    console.log('✅ Created users')

    // Create projects
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: 'Website Redesign',
                description: 'Complete redesign of the company website with modern UI/UX',
                status: ProjectState.ACTIVE,
                priority: Priority.HIGH,
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-04-15'),
                budget: 25000,
                client: 'Acme Corp',
                createdBy: users[0].id
            }
        }),
        prisma.project.create({
            data: {
                name: 'Mobile App Development',
                description: 'Develop a new mobile app for iOS and Android platforms',
                status: ProjectState.ON_HOLD,
                priority: Priority.MEDIUM,
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-08-01'),
                budget: 50000,
                client: 'TechStart Inc',
                createdBy: users[1].id
            }
        }),
        prisma.project.create({
            data: {
                name: 'Marketing Campaign',
                description: 'Q2 marketing campaign for product launch',
                status: ProjectState.ACTIVE,
                priority: Priority.MEDIUM,
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-05-31'),
                budget: 15000,
                client: 'Internal',
                createdBy: users[0].id
            }
        })
    ])

    console.log('✅ Created projects')

    // Create project members
    await Promise.all([
        // Website Redesign team
        prisma.projectMember.create({
            data: {
                projectId: projects[0].id,
                userId: users[0].id,
                role: ProjectRole.OWNER
            }
        }),
        prisma.projectMember.create({
            data: {
                projectId: projects[0].id,
                userId: users[1].id,
                role: ProjectRole.MANAGER
            }
        }),
        prisma.projectMember.create({
            data: {
                projectId: projects[0].id,
                userId: users[2].id,
                role: ProjectRole.MEMBER
            }
        }),
        prisma.projectMember.create({
            data: {
                projectId: projects[0].id,
                userId: users[3].id,
                role: ProjectRole.MEMBER
            }
        }),

        // Mobile App team
        prisma.projectMember.create({
            data: {
                projectId: projects[1].id,
                userId: users[1].id,
                role: ProjectRole.OWNER
            }
        }),
        prisma.projectMember.create({
            data: {
                projectId: projects[1].id,
                userId: users[2].id,
                role: ProjectRole.MEMBER
            }
        }),

        // Marketing Campaign team
        prisma.projectMember.create({
            data: {
                projectId: projects[2].id,
                userId: users[0].id,
                role: ProjectRole.OWNER
            }
        }),
        prisma.projectMember.create({
            data: {
                projectId: projects[2].id,
                userId: users[3].id,
                role: ProjectRole.MEMBER
            }
        })
    ])

    console.log('✅ Created project members')

    // Create project statuses
    const statuses = await Promise.all([
        // Website Redesign statuses
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'To Do',
                description: 'Tasks that need to be started',
                color: '#6B7280',
                order: 1,
                isDefault: true
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'In Progress',
                description: 'Tasks currently being worked on',
                color: '#3B82F6',
                order: 2
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'Review',
                description: 'Tasks ready for review',
                color: '#F59E0B',
                order: 3
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[0].id,
                title: 'Done',
                description: 'Completed tasks',
                color: '#10B981',
                order: 4
            }
        }),

        // Mobile App statuses
        prisma.projectStatus.create({
            data: {
                projectId: projects[1].id,
                title: 'On Hold',
                description: 'Tasks that are temporarily paused',
                color: '#8B5CF6',
                order: 1,
                isDefault: true
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[1].id,
                title: 'Development',
                description: 'Tasks in development',
                color: '#3B82F6',
                order: 2
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[1].id,
                title: 'Testing',
                description: 'Tasks in testing phase',
                color: '#F59E0B',
                order: 3
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[1].id,
                title: 'Deployed',
                description: 'Tasks deployed to production',
                color: '#10B981',
                order: 4
            }
        }),

        // Marketing Campaign statuses
        prisma.projectStatus.create({
            data: {
                projectId: projects[2].id,
                title: 'Draft',
                description: 'Content in draft phase',
                color: '#6B7280',
                order: 1,
                isDefault: true
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[2].id,
                title: 'In Review',
                description: 'Content under review',
                color: '#F59E0B',
                order: 2
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[2].id,
                title: 'Approved',
                description: 'Content approved and ready',
                color: '#10B981',
                order: 3
            }
        }),
        prisma.projectStatus.create({
            data: {
                projectId: projects[2].id,
                title: 'Published',
                description: 'Content published',
                color: '#059669',
                order: 4
            }
        })
    ])

    console.log('✅ Created project statuses')

    // Create tasks
    const tasks = await Promise.all([
        // Website Redesign tasks
        prisma.task.create({
            data: {
                title: 'Design Homepage',
                description: 'Create new homepage design with modern layout and improved UX',
                projectId: projects[0].id,
                statusId: statuses[2].id, // In Progress
                priority: Priority.HIGH,
                dueDate: new Date('2024-02-15'),
                estimatedHours: 16,
                actualHours: 12,
                assignedTo: users[2].id,
                createdBy: users[0].id
            }
        }),
        prisma.task.create({
            data: {
                title: 'Implement Navigation',
                description: 'Build responsive navigation component with mobile menu',
                projectId: projects[0].id,
                statusId: statuses[1].id, // To Do
                priority: Priority.MEDIUM,
                dueDate: new Date('2024-02-28'),
                estimatedHours: 8,
                assignedTo: users[3].id,
                createdBy: users[1].id
            }
        }),
        prisma.task.create({
            data: {
                title: 'Content Migration',
                description: 'Migrate existing content to new CMS structure',
                projectId: projects[0].id,
                statusId: statuses[0].id, // To Do
                priority: Priority.LOW,
                dueDate: new Date('2024-03-10'),
                estimatedHours: 20,
                assignedTo: users[2].id,
                createdBy: users[0].id
            }
        }),
        prisma.task.create({
            data: {
                title: 'SEO Optimization',
                description: 'Optimize website for search engines',
                projectId: projects[0].id,
                statusId: statuses[3].id, // Done
                priority: Priority.MEDIUM,
                dueDate: new Date('2024-02-10'),
                estimatedHours: 6,
                actualHours: 6,
                assignedTo: users[1].id,
                createdBy: users[0].id
            }
        }),

        // Mobile App tasks
        prisma.task.create({
            data: {
                title: 'App Architecture Design',
                description: 'Design the overall app architecture and data flow',
                projectId: projects[1].id,
                statusId: statuses[4].id, // On Hold
                priority: Priority.HIGH,
                dueDate: new Date('2024-03-15'),
                estimatedHours: 24,
                assignedTo: users[1].id,
                createdBy: users[1].id
            }
        }),
        prisma.task.create({
            data: {
                title: 'UI/UX Design',
                description: 'Create app wireframes and design mockups',
                projectId: projects[1].id,
                statusId: statuses[4].id, // On Hold
                priority: Priority.HIGH,
                dueDate: new Date('2024-03-20'),
                estimatedHours: 32,
                assignedTo: users[2].id,
                createdBy: users[1].id
            }
        }),

        // Marketing Campaign tasks
        prisma.task.create({
            data: {
                title: 'Campaign Strategy',
                description: 'Develop comprehensive marketing campaign strategy',
                projectId: projects[2].id,
                statusId: statuses[8].id, // Draft
                priority: Priority.HIGH,
                dueDate: new Date('2024-02-15'),
                estimatedHours: 12,
                assignedTo: users[0].id,
                createdBy: users[0].id
            }
        }),
        prisma.task.create({
            data: {
                title: 'Social Media Content',
                description: 'Create social media posts and graphics',
                projectId: projects[2].id,
                statusId: statuses[9].id, // In Review
                priority: Priority.MEDIUM,
                dueDate: new Date('2024-02-20'),
                estimatedHours: 16,
                assignedTo: users[3].id,
                createdBy: users[0].id
            }
        })
    ])

    console.log('✅ Created tasks')

    // Create some subtasks
    await Promise.all([
        prisma.subtask.create({
            data: {
                taskId: tasks[0].id,
                title: 'Create wireframes',
                isCompleted: true,
                order: 1
            }
        }),
        prisma.subtask.create({
            data: {
                taskId: tasks[0].id,
                title: 'Design mockups',
                isCompleted: true,
                order: 2
            }
        }),
        prisma.subtask.create({
            data: {
                taskId: tasks[0].id,
                title: 'Get stakeholder approval',
                isCompleted: false,
                order: 3
            }
        }),
        prisma.subtask.create({
            data: {
                taskId: tasks[1].id,
                title: 'Create navigation component',
                isCompleted: false,
                order: 1
            }
        }),
        prisma.subtask.create({
            data: {
                taskId: tasks[1].id,
                title: 'Add mobile responsiveness',
                isCompleted: false,
                order: 2
            }
        })
    ])

    console.log('✅ Created subtasks')

    // Create some task comments
    await Promise.all([
        prisma.taskComment.create({
            data: {
                taskId: tasks[0].id,
                userId: users[1].id,
                content: 'Great progress on the design! The new layout looks much cleaner.'
            }
        }),
        prisma.taskComment.create({
            data: {
                taskId: tasks[0].id,
                userId: users[2].id,
                content: 'Thanks! I\'ll have the stakeholder review ready by tomorrow.'
            }
        }),
        prisma.taskComment.create({
            data: {
                taskId: tasks[1].id,
                userId: users[3].id,
                content: 'Starting work on the navigation component today.'
            }
        })
    ])

    console.log('✅ Created task comments')

    // Create project tags
    await Promise.all([
        prisma.projectTag.create({
            data: {
                projectId: projects[0].id,
                name: 'Frontend',
                color: '#3B82F6'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[0].id,
                name: 'Design',
                color: '#8B5CF6'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[0].id,
                name: 'SEO',
                color: '#10B981'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[1].id,
                name: 'Mobile',
                color: '#F59E0B'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[1].id,
                name: 'iOS',
                color: '#000000'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[1].id,
                name: 'Android',
                color: '#3DDC84'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[2].id,
                name: 'Social Media',
                color: '#E4405F'
            }
        }),
        prisma.projectTag.create({
            data: {
                projectId: projects[2].id,
                name: 'Content',
                color: '#6B7280'
            }
        })
    ])

    console.log('✅ Created project tags')

    // Create milestones
    await Promise.all([
        prisma.milestone.create({
            data: {
                projectId: projects[0].id,
                title: 'Design Phase Complete',
                description: 'All design work completed and approved',
                dueDate: new Date('2024-02-28'),
                isCompleted: false
            }
        }),
        prisma.milestone.create({
            data: {
                projectId: projects[0].id,
                title: 'Development Phase Complete',
                description: 'All development work completed',
                dueDate: new Date('2024-03-31'),
                isCompleted: false
            }
        }),
        prisma.milestone.create({
            data: {
                projectId: projects[0].id,
                title: 'Website Launch',
                description: 'Website goes live',
                dueDate: new Date('2024-04-15'),
                isCompleted: false
            }
        }),
        prisma.milestone.create({
            data: {
                projectId: projects[1].id,
                title: 'Planning Complete',
                description: 'App planning and design phase complete',
                dueDate: new Date('2024-04-01'),
                isCompleted: false
            }
        }),
        prisma.milestone.create({
            data: {
                projectId: projects[2].id,
                title: 'Campaign Launch',
                description: 'Marketing campaign goes live',
                dueDate: new Date('2024-03-01'),
                isCompleted: false
            }
        })
    ])

    console.log('✅ Created milestones')

    // Create project threads
    const threads = await Promise.all([
        prisma.projectThread.create({
            data: {
                projectId: projects[0].id,
                title: 'Design Feedback Discussion',
                description: 'General discussion about design decisions and feedback',
                isPinned: true,
                createdBy: users[0].id
            }
        }),
        prisma.projectThread.create({
            data: {
                projectId: projects[0].id,
                title: 'Technical Implementation Questions',
                description: 'Questions and answers about technical implementation details',
                isPinned: false,
                createdBy: users[1].id
            }
        }),
        prisma.projectThread.create({
            data: {
                projectId: projects[1].id,
                title: 'App Architecture Discussion',
                description: 'Discussion about the mobile app architecture and technology choices',
                isPinned: true,
                createdBy: users[1].id
            }
        }),
        prisma.projectThread.create({
            data: {
                projectId: projects[2].id,
                title: 'Campaign Strategy Brainstorming',
                description: 'Brainstorming session for marketing campaign ideas',
                isPinned: false,
                createdBy: users[0].id
            }
        })
    ])

    console.log('✅ Created project threads')

    // Create thread messages
    const messages = await Promise.all([
        // Design Feedback Discussion messages
        prisma.threadMessage.create({
            data: {
                threadId: threads[0].id,
                content: 'I think we should go with a more minimalist approach for the homepage. The current design feels too cluttered.',
                userId: users[0].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[0].id,
                content: 'I agree with Alice. A cleaner design would improve user experience and load times.',
                userId: users[1].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[0].id,
                content: 'What about the color scheme? Should we stick with the current brand colors or try something new?',
                userId: users[2].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[0].id,
                content: 'I think we should maintain brand consistency but maybe use a lighter palette for better readability.',
                userId: users[0].id
            }
        }),

        // Technical Implementation Questions messages
        prisma.threadMessage.create({
            data: {
                threadId: threads[1].id,
                content: 'What\'s the best approach for implementing the responsive navigation? Should we use CSS Grid or Flexbox?',
                userId: users[1].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[1].id,
                content: 'I recommend Flexbox for the navigation. It\'s more flexible for different screen sizes and easier to maintain.',
                userId: users[3].id
            }
        }),

        // App Architecture Discussion messages
        prisma.threadMessage.create({
            data: {
                threadId: threads[2].id,
                content: 'Should we go with React Native or Flutter for cross-platform development?',
                userId: users[1].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[2].id,
                content: 'React Native would be better since our team already has React experience.',
                userId: users[2].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[2].id,
                content: 'Agreed. React Native will also make it easier to share code between web and mobile.',
                userId: users[1].id
            }
        }),

        // Campaign Strategy Brainstorming messages
        prisma.threadMessage.create({
            data: {
                threadId: threads[3].id,
                content: 'Let\'s brainstorm some creative campaign ideas. What channels should we focus on?',
                userId: users[0].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[3].id,
                content: 'I think we should focus on social media and influencer partnerships.',
                userId: users[3].id
            }
        }),
        prisma.threadMessage.create({
            data: {
                threadId: threads[3].id,
                content: 'What about email marketing? We have a good subscriber list we can leverage.',
                userId: users[0].id
            }
        })
    ])

    console.log('✅ Created thread messages')

    // Create some thread tags
    await Promise.all([
        prisma.threadTag.create({
            data: {
                threadId: threads[0].id,
                name: 'Design',
                color: '#8B5CF6'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[0].id,
                name: 'Feedback',
                color: '#F59E0B'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[1].id,
                name: 'Technical',
                color: '#3B82F6'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[1].id,
                name: 'Frontend',
                color: '#10B981'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[2].id,
                name: 'Architecture',
                color: '#EF4444'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[2].id,
                name: 'Mobile',
                color: '#F59E0B'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[3].id,
                name: 'Marketing',
                color: '#E4405F'
            }
        }),
        prisma.threadTag.create({
            data: {
                threadId: threads[3].id,
                name: 'Strategy',
                color: '#6B7280'
            }
        })
    ])

    console.log('✅ Created thread tags')

    console.log('🎉 Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 