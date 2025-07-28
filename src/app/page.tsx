'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailImport } from "@/components/email-import"
import { TimelineView } from "@/components/timeline-view"
import { useState, useEffect } from "react"

export default function Home() {
  const [emailThreads, setEmailThreads] = useState<any[]>([])
  const [timelines, setTimelines] = useState<any[]>([])
  const [selectedTimeline, setSelectedTimeline] = useState<any>(null)
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
                      <div className="space-y-4">
                        {/* Main participant info */}
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {thread.participants?.[0]?.user?.name?.split(' ').map((n: string) => n[0]).join('') ||
                                thread.participants?.[0]?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {thread.participants?.[0]?.user?.name || thread.participants?.[0]?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {thread.participants?.[0]?.email || 'No email'}
                              {thread.participants?.[0]?.user && (
                                <span className="ml-2 text-green-600">✓ Linked User</span>
                              )}
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

                        {/* Participants list */}
                        {thread.participants && thread.participants.length > 1 && (
                          <div className="border-t pt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Participants ({thread.participants.length})
                            </p>
                            <div className="space-y-1">
                              {thread.participants.slice(0, 3).map((participant: any) => (
                                <div key={participant.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                    <span className="font-medium">
                                      {participant.user?.name || participant.name || 'Unknown'}
                                    </span>
                                    <span className="text-muted-foreground">({participant.role})</span>
                                  </div>
                                  <span className="text-muted-foreground">
                                    {participant.user ? '✓ Linked' : '⚠ Not Linked'}
                                  </span>
                                </div>
                              ))}
                              {thread.participants.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{thread.participants.length - 3} more participants
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
              <div className="flex gap-2">
                {selectedTimeline && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTimeline(null)}
                  >
                    Back to List
                  </Button>
                )}
                <Button>Create Timeline</Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading timelines...</p>
              </div>
            ) : timelines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No timelines found. Import email threads to generate timelines!</p>
              </div>
            ) : selectedTimeline ? (
              // Detailed Timeline View
              <TimelineView timeline={selectedTimeline} />
            ) : (
              // Timeline List View
              <div className="grid gap-6">
                {timelines.map((timeline) => (
                  <Card key={timeline.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTimeline(timeline)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{timeline.title}</CardTitle>
                          <CardDescription>
                            {timeline.description}
                          </CardDescription>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{timeline.events?.length || 0} events</span>
                            <span>•</span>
                            <span>{timeline.thread?.participants?.length || 0} participants</span>
                            <span>•</span>
                            <span>{new Date(timeline.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={timeline.isPublic ? "default" : "secondary"}>
                          {timeline.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Thread Info Preview */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Thread:</span>
                          <span className="text-sm text-muted-foreground">{timeline.thread?.subject}</span>
                        </div>

                        {/* Participants Preview */}
                        {timeline.thread?.participants && timeline.thread.participants.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Participants:</span>
                            <div className="flex flex-wrap gap-2">
                              {timeline.thread.participants.slice(0, 3).map((participant: any) => (
                                <div key={participant.id} className="flex items-center space-x-2 text-xs">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback>
                                      {(participant.user?.name || participant.name || participant.email)
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {participant.user?.name || participant.name || participant.email}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {participant.role}
                                  </Badge>
                                </div>
                              ))}
                              {timeline.thread.participants.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{timeline.thread.participants.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags Preview */}
                        {timeline.thread?.tags && timeline.thread.tags.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {timeline.thread.tags.slice(0, 3).map((tag: any) => (
                                <Badge
                                  key={tag.id}
                                  style={{ backgroundColor: tag.color }}
                                  className="text-white text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {timeline.thread.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{timeline.thread.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Events Preview */}
                        {timeline.events && timeline.events.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Recent Events:</span>
                            <div className="space-y-1">
                              {timeline.events.slice(0, 3).map((event: any) => (
                                <div key={event.id} className="flex items-center space-x-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${event.eventType === 'EMAIL_RECEIVED' ? 'bg-blue-500' :
                                      event.eventType === 'EMAIL_REPLIED' ? 'bg-green-500' :
                                        event.eventType === 'EMAIL_FORWARDED' ? 'bg-yellow-500' :
                                          'bg-gray-500'
                                    }`}></div>
                                  <span className="text-muted-foreground">{event.title}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleDateString()}</span>
                                </div>
                              ))}
                              {timeline.events.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{timeline.events.length - 3} more events
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
