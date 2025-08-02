'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, DollarSign, Target } from "lucide-react"
import { formatProjectStatus } from "@/lib/utils"

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
        image: string
    }
    members: Array<{
        id: string
        role: string
        user: {
            id: string
            name: string
            email: string
            image: string
        }
    }>
}

interface ProjectOverviewProps {
    project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getProgressPercentage = () => {
        if (!project.startDate || !project.endDate) return 0

        const start = new Date(project.startDate).getTime()
        const end = new Date(project.endDate).getTime()
        const now = new Date().getTime()

        if (now < start) return 0
        if (now > end) return 100

        return Math.round(((now - start) / (end - start)) * 100)
    }

    const progress = getProgressPercentage()

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Key information about this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{formatProjectStatus(project.status)}</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{project.priority}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{project.startDate ? formatDate(project.startDate) : 'Not set'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <Target className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{project.endDate ? formatDate(project.endDate) : 'Not set'}</span>
                                </div>
                            </div>
                        </div>

                        {project.budget && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Budget</label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">${project.budget.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {project.client && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Client</label>
                                <div className="mt-1">
                                    <span className="text-sm">{project.client}</span>
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <div className="mt-1">
                                <p className="text-sm text-muted-foreground">{project.description || 'No description provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Progress</CardTitle>
                        <CardDescription>
                            Timeline progress based on start and end dates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">{progress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {progress === 0 && 'Project not started yet'}
                                {progress > 0 && progress < 100 && 'Project in progress'}
                                {progress >= 100 && 'Project completed'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>Team Members</span>
                        </CardTitle>
                        <CardDescription>
                            {project.members.length} team member{project.members.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Project Creator */}
                            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={project.creator.image} />
                                    <AvatarFallback>
                                        {getInitials(project.creator.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{project.creator.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{project.creator.email}</p>
                                    <Badge variant="outline" className="text-xs mt-1">Creator</Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Team Members */}
                            {project.members.map((member) => (
                                <div key={member.id} className="flex items-center space-x-3">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={member.user.image} />
                                        <AvatarFallback>
                                            {getInitials(member.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {member.role.toLowerCase()}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Project Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Created</span>
                            <span className="text-sm">{formatDate(project.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Updated</span>
                            <span className="text-sm">{formatDate(project.updatedAt)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 