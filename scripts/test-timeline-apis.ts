#!/usr/bin/env tsx

const BASE_URL = 'http://localhost:3000/api'

async function testTimelineAPIs() {
    console.log('🧪 Testing Timeline API Endpoints...\n')

    try {
        // 1. Get all email threads
        console.log('1. Getting email threads...')
        const threadsResponse = await fetch(`${BASE_URL}/email-threads`)
        const threads = await threadsResponse.json()
        console.log(`   Found ${threads.length} email threads`)

        if (threads.length === 0) {
            console.log('   ❌ No email threads found. Please run the seed script first.')
            return
        }

        const firstThread = threads[0]
        console.log(`   Using thread: "${firstThread.subject}"\n`)

        // 2. Check if timeline already exists for this thread
        console.log('2. Checking existing timelines...')
        const existingTimelinesResponse = await fetch(`${BASE_URL}/timelines`)
        const existingTimelines = await existingTimelinesResponse.json()

        let timelineToUse
        if (existingTimelines.length > 0) {
            timelineToUse = existingTimelines[0]
            console.log(`   ✅ Using existing timeline: "${timelineToUse.title}"`)
            console.log(`   Events: ${timelineToUse.events.length}\n`)
        } else {
            console.log('2. Generating timeline from email thread...')
            const generateResponse = await fetch(`${BASE_URL}/timelines/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: firstThread.id,
                    title: `${firstThread.subject} - Generated Timeline`,
                    description: 'Automatically generated timeline from email thread',
                    isPublic: true
                })
            })

            const generatedTimeline = await generateResponse.json()
            timelineToUse = generatedTimeline.timeline
            console.log(`   ✅ Generated timeline: "${timelineToUse.title}"`)
            console.log(`   Events created: ${generatedTimeline.generatedEvents}\n`)
        }

        // 3. Get all timelines
        console.log('3. Getting all timelines...')
        const timelinesResponse = await fetch(`${BASE_URL}/timelines`)
        const timelines = await timelinesResponse.json()
        console.log(`   Found ${timelines.length} timelines\n`)

        // 4. Get specific timeline
        console.log('4. Getting specific timeline...')
        const timelineResponse = await fetch(`${BASE_URL}/timelines/${timelineToUse.id}`)
        const timeline = await timelineResponse.json()
        console.log(`   Timeline: "${timeline.title}"`)
        console.log(`   Events: ${timeline.events.length}\n`)

        // 5. Get timeline events
        console.log('5. Getting timeline events...')
        const eventsResponse = await fetch(`${BASE_URL}/timelines/${timelineToUse.id}/events`)
        const events = await eventsResponse.json()
        console.log(`   Found ${events.length} events:`)
        events.forEach((event: any, index: number) => {
            console.log(`   ${index + 1}. ${event.title} - ${event.description}`)
        })
        console.log()

        // 6. Add a custom event
        console.log('6. Adding custom event...')
        const customEventResponse = await fetch(`${BASE_URL}/timelines/${timelineToUse.id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'CUSTOM',
                title: 'Custom Milestone',
                description: 'This is a custom milestone added via API',
                timestamp: new Date().toISOString(),
                metadata: {
                    customField: 'This is custom metadata',
                    importance: 'high'
                }
            })
        })

        const customEvent = await customEventResponse.json()
        console.log(`   ✅ Added custom event: "${customEvent.title}"\n`)

        // 7. Update the timeline
        console.log('7. Updating timeline...')
        const updateResponse = await fetch(`${BASE_URL}/timelines/${timelineToUse.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `${firstThread.subject} - Updated Timeline`,
                description: 'Timeline updated via API',
                isPublic: false
            })
        })

        const updatedTimeline = await updateResponse.json()
        console.log(`   ✅ Updated timeline: "${updatedTimeline.title}"\n`)

        console.log('🎉 All timeline API tests completed successfully!')
        console.log('\n📊 Summary:')
        console.log(`   - Email threads: ${threads.length}`)
        console.log(`   - Timelines: ${timelines.length}`)
        console.log(`   - Events in generated timeline: ${timeline.events.length}`)
        console.log(`   - Custom events added: 1`)

    } catch (error) {
        console.error('❌ Error testing timeline APIs:', error)
    }
}

// Run the tests
testTimelineAPIs() 