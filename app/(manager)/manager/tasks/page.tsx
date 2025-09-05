"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  ClipboardList,
  CheckCircle,
  XCircle,
  Hourglass,
  Clock,
  Calendar,
  User,
  MapPin,
  Image as ImageIcon,
  RefreshCw,
  ArrowRight,
  Eye
} from "lucide-react"
import Image from "next/image"
import { apiService } from "@/lib/api"
import { Task } from "@/lib/types"

type TaskStatus = Task["status"]

export default function ManagerTasks() {
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const [myTasksData, allTasksData] = await Promise.all([
          apiService.getMyTasks(),
          apiService.getAllTasks(),
        ])
        
        setMyTasks(myTasksData || [])
        setAllTasks(allTasksData || [])
      } catch (err: any) {
        console.error('Error fetching tasks:', err)
        setError(err.message || "Failed to load tasks")
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [myTasksData, allTasksData] = await Promise.all([
        apiService.getMyTasks(),
        apiService.getAllTasks(),
      ])
      
      setMyTasks(myTasksData || [])
      setAllTasks(allTasksData || [])
    } catch (err: any) {
      console.error('Error refreshing tasks:', err)
      setError(err.message || "Failed to refresh tasks")
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusConfig = (status: TaskStatus) => {
    const configs = {
      DONE: {
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Completed",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
      },
      ACCEPTED: {
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Accepted",
        className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
      },
      IN_PROGRESS: {
        icon: <Clock className="h-4 w-4" />,
        label: "In Progress",
        className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
      },
      PENDING: {
        icon: <Hourglass className="h-4 w-4" />,
        label: "Pending",
        className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
      },
      REJECTED: {
        icon: <XCircle className="h-4 w-4" />,
        label: "Rejected",
        className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      },
      TODO: {
        icon: <ClipboardList className="h-4 w-4" />,
        label: "To Do",
        className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
      }
    }
    return configs[status] || configs.TODO
  }

  const getPriorityBorder = (dueDate: string | null) => {
    if (!dueDate) return "border-l-slate-300 dark:border-l-slate-600"
    const due = new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return "border-l-red-500"
    if (diffDays <= 2) return "border-l-orange-500"
    if (diffDays <= 7) return "border-l-yellow-500"
    return "border-l-green-500"
  }

  const renderTasks = (tasks: Task[]) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, staggerChildren: 0.05 }}
        className="space-y-6"
      >
        {tasks.length === 0 ? (
          <Card className="theme-card-filled">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ClipboardList className="h-8 w-8 theme-text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No tasks found</h3>
              <p className="theme-text-muted text-center max-w-sm">
                It looks like there are no tasks to display in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task, index) => {
            const statusConfig = getStatusConfig(task.status)
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <Card className={`theme-card-filled hover:shadow-lg transition-all duration-300 border-l-4 ${getPriorityBorder(task.dueDate)} group cursor-pointer overflow-hidden`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold leading-tight mb-4 group-hover:theme-text-primary transition-colors">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${statusConfig.className} font-medium`}>
                            {statusConfig.icon}
                            <span className="ml-2">{statusConfig.label}</span>
                          </Badge>
                          {task.dueDate && (
                            <Badge variant="outline" className="text-xs font-medium">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="theme-button-outline h-9 px-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-6">
                    {task.description && (
                      <p className="theme-text-muted text-sm leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {task.assignedTo && (
                        <motion.div 
                          className="flex items-center gap-4 p-4 rounded-xl theme-bg-muted/50 hover:theme-bg-muted transition-colors"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="h-11 w-11 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                            <AvatarImage
                              src={task.assignedTo.avatarUrl || "/placeholder.svg"}
                              alt={task.assignedTo.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {task.assignedTo.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-sm">
                              {task.assignedTo.name}
                            </p>
                            <p className="text-xs theme-text-muted flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              Assigned to
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {task.assignedBy && (
                        <motion.div 
                          className="flex items-center gap-4 p-4 rounded-xl theme-bg-muted/50 hover:theme-bg-muted transition-colors"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="h-11 w-11 ring-2 ring-secondary/20 hover:ring-secondary/40 transition-all">
                            <AvatarImage
                              src={task.assignedBy.avatarUrl || "/placeholder.svg"}
                              alt={task.assignedBy.name}
                            />
                            <AvatarFallback className="bg-secondary/10 text-secondary-foreground font-semibold text-sm">
                              {task.assignedBy.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-sm">
                              {task.assignedBy.name}
                            </p>
                            <p className="text-xs theme-text-muted flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              Assigned by
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {task.event && (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="theme-card-outline bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/30 transition-colors">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-5">
                              <div className="relative shrink-0">
                                {task.event.imageUrl ? (
                                  <Image
                                    src={task.event.imageUrl || "/placeholder.svg"}
                                    alt={`Event: ${task.event.title}`}
                                    width={80}
                                    height={80}
                                    className="rounded-xl object-cover ring-2 ring-primary/20"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center ring-2 ring-primary/20">
                                    <ImageIcon className="h-8 w-8 text-primary/60" />
                                  </div>
                                )}
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                  <span className="text-primary font-medium">Related Event:</span>
                                  <span className="truncate">{task.event.title}</span>
                                </h4>
                                <div className="space-y-2 text-sm theme-text-muted">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary/60" />
                                    <span>{task.event.date} at {task.event.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary/60" />
                                    <span className="truncate">{task.event.location}</span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="theme-button-outline h-9 px-3 text-xs shrink-0 hover:bg-primary/10"
                              >
                                View Event
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t theme-border">
                      <div className="flex items-center gap-2 text-xs theme-text-muted">
                        <Clock className="h-3 w-3" />
                        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="theme-button-filled h-8 px-4 text-xs hover:scale-105 transition-transform"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </AnimatePresence>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background theme-transition">
        <div className="max-w-7xl mx-auto p-6">
          <Card className="theme-card-filled">
            <CardContent className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin theme-text-primary" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary/20"></div>
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-3">Loading tasks...</h3>
              <p className="theme-text-muted text-center max-w-sm">
                Please wait while we fetch your tasks.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background theme-transition">
        <div className="max-w-7xl mx-auto p-6">
          <Card className="theme-card-filled">
            <CardContent className="flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">Error loading tasks</h3>
              <p className="theme-text-muted text-center mb-6 max-w-md">{error}</p>
              <div className="flex gap-3">
                <Button onClick={() => window.location.reload()} className="theme-button-filled">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Task Management Dashboard
              </h1>
              <p className="theme-text-muted mt-3 text-lg">
                Monitor and manage all your tasks efficiently
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="theme-button-outline hover:scale-105 transition-transform"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Tasks
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="theme-card-filled shadow-xl">
            <CardContent className="p-8">
              <Tabs defaultValue="my-tasks" className="w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                  <TabsList className="grid w-full lg:w-auto grid-cols-2 theme-card-filled p-1.5 h-14 bg-muted/30">
                    <TabsTrigger
                      value="my-tasks"
                      className="theme-button-outline data-[state=active]:theme-button-filled data-[state=active]:shadow-lg font-semibold text-base px-8 py-3 hover:scale-105 transition-all"
                    >
                      My Tasks ({myTasks.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="all-tasks"
                      className="theme-button-outline data-[state=active]:theme-button-filled data-[state=active]:shadow-lg font-semibold text-base px-8 py-3 hover:scale-105 transition-all"
                    >
                      All Tasks ({allTasks.length})
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="my-tasks" className="mt-0">
                  {renderTasks(myTasks)}
                </TabsContent>
                
                <TabsContent value="all-tasks" className="mt-0">
                  {renderTasks(allTasks)}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}