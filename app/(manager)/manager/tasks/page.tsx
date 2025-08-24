"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Import Avatar components
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
  ImageIcon,
} from "lucide-react" // Added more icons
import Image from "next/image"
import { apiService } from "@/lib/api"
import { Task } from "@/lib/types"


export default function ManagerTasks() {
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const [myTasksData, allTasksData] = await Promise.all([apiService.getMyTasks(), apiService.getAllTasks()])
        setMyTasks(myTasksData || [])
        setAllTasks(allTasksData || [])
      } catch (err: any) {
        setError(err.message || "Failed to load tasks")
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, []) // [^2][^3]

  const getStatusClasses = (status: TaskStatus) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-700"
      case "ACCEPTED":
        return "bg-teal-100 text-teal-700"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700"
      case "PENDING":
        return "bg-orange-100 text-orange-700"
      case "REJECTED":
        return "bg-red-100 text-red-700"
      case "TODO":
      default:
        return "bg-blue-100 text-blue-700"
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "DONE":
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4" />
      case "PENDING":
        return <Hourglass className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      case "TODO":
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  const renderTasks = (tasks: Task[]) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 mt-6"
    >
      {tasks.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
          <ClipboardList className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No tasks found.</p>
          <p className="text-sm">It looks like there are no tasks to display in this category.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.id}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden flex flex-col"
          >
            <CardContent className="p-6 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800 leading-tight pr-4">{task.title}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClasses(task.status)}`}
                >
                  {getStatusIcon(task.status)}
                  {task.status.replace("_", " ")}
                </span>
              </div>
              {task.description && <p className="text-gray-600 text-sm mb-4 flex-grow">{task.description}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700 mt-auto pt-4 border-t border-gray-100">
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {task.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {task.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedTo.avatarUrl || "/placeholder.svg"} alt={task.assignedTo.name} />
                      <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Assigned To: {task.assignedTo.name}</span>
                  </div>
                )}
                {task.assignedBy && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedBy.avatarUrl || "/placeholder.svg"} alt={task.assignedBy.name} />
                      <AvatarFallback>{task.assignedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Assigned By: {task.assignedBy.name}</span>
                  </div>
                )}
              </div>

              {task.event && (
                <Card className="mt-4 bg-gray-50 border border-gray-200 shadow-inner">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {task.event.imageUrl && (
                      <Image
                        src={task.event.imageUrl || "/placeholder.svg"}
                        alt={`Image for ${task.event.title}`}
                        width={96} // Corresponds to w-24 (24 * 4 = 96px)
                        height={96} // Corresponds to h-24 (24 * 4 = 96px)
                        className="rounded-md object-fill w-24 h-24 flex-shrink-0"
                      />
                    )}
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                        Event: {task.event.title}
                      </h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {task.event.date} at {task.event.time}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {task.event.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-lg font-medium">Loading tasks...</p>
        <p className="text-sm">Please wait while we fetch your tasks.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <XCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Error loading tasks</p>
        <p className="text-sm text-gray-600">{error}</p>
        <p className="text-sm text-gray-600 mt-2">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8 text-center sm:text-left"
      >
        Task Management Dashboard
      </motion.h1>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <Tabs defaultValue="my-tasks" className="w-full">
          <TabsList className="bg-gray-100 p-0.5 rounded-lg flex justify-center w-full mb-6">
            {" "}
            {/* Centered, full width, rectangular tabs list */}
            <TabsTrigger
              value="my-tasks"
              className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-5 py-2 rounded-md transition-all duration-200 text-base font-medium" // Rectangular, full width triggers, subtle active state
            >
              My Tasks ({myTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="all-tasks"
              className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm px-5 py-2 rounded-md transition-all duration-200 text-base font-medium" // Rectangular, full width triggers, subtle active state
            >
              All Tasks ({allTasks.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-tasks">{renderTasks(myTasks)}</TabsContent>
          <TabsContent value="all-tasks">{renderTasks(allTasks)}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
