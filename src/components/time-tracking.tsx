'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Square, Plus, Clock, DollarSign, Calendar } from "lucide-react"
import { useSession, signOut } from 'next-auth/react'
import { formatDuration, formatTimeEntry, calculateBillableAmount } from '@/lib/utils'

interface TimeEntry {
    id: string
    description: string
    startTime: string
    endTime: string | null
    duration: number | null
    isRunning: boolean
    billable: boolean
    hourlyRate: number | null
    notes: string | null
    createdAt: string
    updatedAt: string
    user: {
        id: string
        name: string
        email: string
        image: string
    }
    category: {
        id: string
        name: string
        color: string
    } | null
    task: {
        id: string
        title: string
    } | null
}

interface TimeCategory {
    id: string
    name: string
    color: string
    isDefault: boolean
}

interface Task {
    id: string
    title: string
}

interface TimeTrackingProps {
    projectId: string
}

export function TimeTracking({ projectId }: TimeTrackingProps) {
    const { data: session } = useSession()
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
    const [categories, setCategories] = useState<TimeCategory[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Timer state
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Form state
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
    const [formData, setFormData] = useState({
        description: '',
        categoryId: '',
        taskId: '',
        startTime: '',
        endTime: '',
        duration: '',
        billable: true,
        hourlyRate: '',
        notes: ''
    })

    useEffect(() => {
        fetchTimeEntries()
        fetchCategories()
        fetchTasks()
        checkRunningTimer()
    }, [projectId])

    useEffect(() => {
        if (isTimerRunning && currentTimer) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isTimerRunning, currentTimer])

    const fetchTimeEntries = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/time-entries`)
            if (!response.ok) throw new Error('Failed to fetch time entries')
            const data = await response.json()
            setTimeEntries(data.timeEntries)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch time entries')
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/time-categories`)
            if (!response.ok) throw new Error('Failed to fetch categories')
            const data = await response.json()
            setCategories(data)
        } catch (err) {
            console.error('Failed to fetch categories:', err)
        }
    }

    const fetchTasks = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`)
            if (!response.ok) throw new Error('Failed to fetch tasks')
            const data = await response.json()
            setTasks(data.tasks || [])
        } catch (err) {
            console.error('Failed to fetch tasks:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const checkRunningTimer = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/time-entries?isRunning=true`)
            if (response.ok) {
                const data = await response.json()
                const runningEntry = data.timeEntries.find((entry: TimeEntry) => entry.isRunning && entry.user.id === session?.user?.id)

                if (runningEntry) {
                    setCurrentTimer(runningEntry)
                    setIsTimerRunning(true)
                    const startTime = new Date(runningEntry.startTime).getTime()
                    const now = Date.now()
                    setElapsedTime(Math.floor((now - startTime) / 1000))
                }
            }
        } catch (err) {
            console.error('Failed to check running timer:', err)
        }
    }

    const startTimer = async () => {
        if (!session?.user?.id) return

        try {
            const response = await fetch(`/api/projects/${projectId}/time-entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    description: 'Timer started',
                    startTime: new Date().toISOString(),
                    isRunning: true,
                    billable: true
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to start timer')
            }

            const newEntry = await response.json()
            setCurrentTimer(newEntry)
            setIsTimerRunning(true)
            setElapsedTime(0)
            fetchTimeEntries()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start timer')
        }
    }

    const stopTimer = async () => {
        if (!currentTimer) return

        try {
            const endTime = new Date()
            const duration = Math.floor((endTime.getTime() - new Date(currentTimer.startTime).getTime()) / 1000)

            const response = await fetch(`/api/projects/${projectId}/time-entries/${currentTimer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endTime: endTime.toISOString(),
                    duration,
                    isRunning: false
                })
            })

            if (!response.ok) throw new Error('Failed to stop timer')

            setIsTimerRunning(false)
            setCurrentTimer(null)
            setElapsedTime(0)
            fetchTimeEntries()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop timer')
        }
    }

    const createManualEntry = async () => {
        if (!session?.user?.id) return

        try {
            const response = await fetch(`/api/projects/${projectId}/time-entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id,
                    description: formData.description,
                    categoryId: formData.categoryId || null,
                    taskId: formData.taskId || null,
                    startTime: formData.startTime,
                    endTime: formData.endTime || null,
                    duration: formData.duration ? parseInt(formData.duration) * 60 : null, // Convert minutes to seconds
                    billable: formData.billable,
                    hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
                    notes: formData.notes
                })
            })

            if (!response.ok) throw new Error('Failed to create time entry')

            setIsManualEntryOpen(false)
            setFormData({
                description: '',
                categoryId: '',
                taskId: '',
                startTime: '',
                endTime: '',
                duration: '',
                billable: true,
                hourlyRate: '',
                notes: ''
            })
            fetchTimeEntries()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create time entry')
        }
    }

    const clearRunningTimers = async () => {
        if (!session?.user?.id) return

        try {
            const response = await fetch(`/api/projects/${projectId}/time-entries/clear-running`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session.user.id
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to clear running timers')
            }

            const result = await response.json()
            console.log('Cleared running timers:', result)

            // Refresh the time entries
            fetchTimeEntries()
            checkRunningTimer()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear running timers')
        }
    }

    const testSession = async () => {
        console.log('=== TEST SESSION ===')
        console.log('Session:', session)

        try {
            const response = await fetch('/api/auth/session')
            const sessionData = await response.json()
            console.log('Session API response:', sessionData)
        } catch (err) {
            console.error('Session API error:', err)
        }
    }

    const fixSession = async () => {
        console.log('=== FIX SESSION ===')
        if (!session?.user?.email) {
            console.log('No email in session')
            return
        }

        try {
            const response = await fetch('/api/fix-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email })
            })

            const data = await response.json()
            console.log('Fix session response:', data)

            if (data.user) {
                console.log('Correct user ID:', data.user.id)
                console.log('Current session user ID:', session.user.id)
                console.log('Mismatch detected! Please sign out and sign back in.')
            }
        } catch (err) {
            console.error('Fix session error:', err)
        }
    }


    const calculateTotalTime = () => {
        return timeEntries.reduce((total, entry) => {
            if (entry.duration) return total + entry.duration
            return total
        }, 0)
    }

    const calculateTotalBillable = () => {
        return timeEntries.reduce((total, entry) => {
            if (entry.billable && entry.duration && entry.hourlyRate) {
                return total + (entry.duration / 3600) * entry.hourlyRate
            }
            return total
        }, 0)
    }

    if (isLoading) {
        return <div className="text-center py-8">Loading time tracking...</div>
    }

    return (
        <div className="space-y-6">
            {/* Timer Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Time Tracker
                    </CardTitle>
                    <CardDescription>
                        Track your time on this project
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isTimerRunning && currentTimer ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-3xl font-mono font-bold text-primary">
                                    {formatDuration(elapsedTime)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {currentTimer.description}
                                </p>
                            </div>
                            <div className="flex justify-center gap-2">
                                <Button onClick={stopTimer} variant="destructive">
                                    <Square className="h-4 w-4 mr-2" />
                                    Stop Timer
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="text-3xl font-mono font-bold text-muted-foreground">
                                00:00:00
                            </div>
                            <div className="flex justify-center gap-2">
                                <Button onClick={startTimer} disabled={!session?.user?.id}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Timer
                                </Button>
                                <Button onClick={clearRunningTimers} variant="outline" size="sm">
                                    Clear Running
                                </Button>
                                <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Manual Entry
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add Manual Time Entry</DialogTitle>
                                            <DialogDescription>
                                                Add a time entry manually
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="description">Description</Label>
                                                <Input
                                                    id="description"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="What did you work on?"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="startTime">Start Time</Label>
                                                    <Input
                                                        id="startTime"
                                                        type="datetime-local"
                                                        value={formData.startTime}
                                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="endTime">End Time</Label>
                                                    <Input
                                                        id="endTime"
                                                        type="datetime-local"
                                                        value={formData.endTime}
                                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                                    <Input
                                                        id="duration"
                                                        type="number"
                                                        value={formData.duration}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                        placeholder="120"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                                    <Input
                                                        id="hourlyRate"
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.hourlyRate}
                                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                        placeholder="75.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="category">Category</Label>
                                                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="task">Task (Optional)</Label>
                                                <Select value={formData.taskId} onValueChange={(value) => setFormData({ ...formData, taskId: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select task" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tasks.map((task) => (
                                                            <SelectItem key={task.id} value={task.id}>
                                                                {task.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="notes">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    placeholder="Additional notes..."
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="billable"
                                                    checked={formData.billable}
                                                    onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                                                />
                                                <Label htmlFor="billable">Billable</Label>
                                            </div>
                                            <Button onClick={createManualEntry} className="w-full">
                                                Add Time Entry
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Total Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatDuration(calculateTotalTime())}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Billable Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${calculateTotalBillable().toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Entries Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {timeEntries.filter(entry => {
                                const today = new Date().toDateString()
                                return new Date(entry.startTime).toDateString() === today
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Time Entries List */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Time Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {timeEntries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No time entries yet. Start tracking your time!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timeEntries.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={entry.user.image} />
                                            <AvatarFallback>{entry.user.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{entry.description}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                                                <span>{entry.user.name}</span>
                                                {entry.category && (
                                                    <Badge
                                                        variant="outline"
                                                        style={{ backgroundColor: entry.category.color + '20', borderColor: entry.category.color }}
                                                    >
                                                        {entry.category.name}
                                                    </Badge>
                                                )}
                                                {entry.task && (
                                                    <span className="text-blue-600">Task: {entry.task.title}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-medium">
                                            {entry.duration ? formatDuration(entry.duration) : 'Running...'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatTimeEntry(entry.startTime)}
                                        </div>
                                        {entry.billable && entry.hourlyRate && entry.duration && (
                                            <div className="text-sm text-green-600">
                                                ${calculateBillableAmount(entry.duration, entry.hourlyRate).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 