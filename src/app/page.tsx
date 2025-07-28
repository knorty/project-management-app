'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailImport } from "@/components/email-import"
import { useState, useEffect } from "react"

export default function Home() {
  const [emailThreads, setEmailThreads] = useState<any[]>([])
  const [timelines, setTimelines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [threadsResponse, timelinesResponse] = await Promise.all([
        fetch('/api/email-threads'),
        fetch('/api/timelines')
      ])

      const threads = await threadsResponse.json()
      const timelineData = await timelinesResponse.json()

      setEmailThreads(threads)
      setTimelines(timelineData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportSuccess = (result: any) => {
    setNotification({ type: 'success', message: `Successfully imported ${result.importedMessages} messages` })
    fetchData() // Refresh the data
    setTimeout(() => setNotification(null), 3000)
  }

  const handleImportError = (error: string) => {
    setNotification({ type: 'error', message: error })
    setTimeout(() => setNotification(null), 5000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Email Thread Manager</h1>
          <p className="text-muted-foreground mt-2">
            Transform email threads into beautiful, readable timelines
          </p>
        </div>

        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
            {notification.message}
          </div>
        )}

        <Tabs defaultValue="threads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="threads">Email Threads</TabsTrigger>
            <TabsTrigger value="timelines">Timelines</TabsTrigger>
          </TabsList>

          <TabsContent value="threads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Email Threads</h2>
              <div className="flex gap-2">
                <EmailImport
                  onImportSuccess={handleImportSuccess}
                  onImportError={handleImportError}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading email threads...</p>
              </div>
            ) : emailThreads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No email threads found. Import your first email thread to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {emailThreads.map((thread) => (
                  <Card key={thread.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{thread.subject}</CardTitle>
                          <CardDescription>
                            {thread.participants?.length || 0} participants • {thread._count?.messages || 0} messages
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{thread._count?.messages || 0} messages</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {thread.participants?.[0]?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {thread.participants?.[0]?.name || thread.participants?.[0]?.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {thread.participants?.[0]?.email || 'No email'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(thread.updatedAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {thread.tags?.slice(0, 2).map((tag: any) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timelines" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Timeline Views</h2>
              <Button>Create Timeline</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading timelines...</p>
              </div>
            ) : timelines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No timelines found. Import email threads to generate timelines!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timelines.map((timeline) => (
                  <Card key={timeline.id}>
                    <CardHeader>
                      <CardTitle>{timeline.title}</CardTitle>
                      <CardDescription>
                        {timeline.description} • {timeline.events?.length || 0} events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {timeline.events?.map((event: any, index: number) => (
                          <div key={event.id}>
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${event.eventType === 'EMAIL_RECEIVED' ? 'bg-primary' :
                                event.eventType === 'EMAIL_REPLIED' ? 'bg-green-500' :
                                  event.eventType === 'EMAIL_FORWARDED' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                }`}></div>
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {index < timeline.events.length - 1 && <Separator className="mt-4" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
