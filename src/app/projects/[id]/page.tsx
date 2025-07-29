'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProjectThreads } from "@/components/project-threads"
import { ProjectTimeline } from "@/components/project-timeline"
import { ProjectOverview } from "@/components/project-overview"

interface Project {
    id: string
    name: string
    description: string
    status: string
    priority: string
    startDate: string
    endDate: string
    budget: number
    client: string
    createdAt: string
    updatedAt: string
    creator: {
        id: string
        name: string
        email: string
        avatar: string
    }
    members: Array<{
        id: string
        role: string
        user: {
            id: string
            name: string
            email: string
            avatar: string
        }
    }>
    _count: {
        tasks: number
        threads: number
    }
}

export default function ProjectPage() {
    const params = useParams()
    const projectId = params.id as string
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProject()
    }, [projectId])

    const fetchProject = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/projects/${projectId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch project')
            }
            const data = await response.json()
            setProject(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading project...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-8">
                        <p className="text-red-600">Error: {error || 'Project not found'}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Project Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                            <p className="text-muted-foreground text-lg">{project.description}</p>
                            <div className="flex items-center space-x-4">
                                <Badge variant="outline">{project.status}</Badge>
                                <Badge variant="outline">{project.priority}</Badge>
                                {project.client && (
                                    <span className="text-sm text-muted-foreground">
                                        Client: {project.client}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline">Edit Project</Button>
                            <Button>New Thread</Button>
                        </div>
                    </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project._count.tasks}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Threads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project._count.threads}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.members.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${project.budget?.toLocaleString() || '0'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="threads">Threads</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <ProjectOverview project={project} />
                    </TabsContent>

                    <TabsContent value="threads" className="space-y-6">
                        <ProjectThreads projectId={projectId} />
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-6">
                        <ProjectTimeline projectId={projectId} />
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-6">
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Task management coming soon...</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 