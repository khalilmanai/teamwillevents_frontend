"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Clock, CheckCircle2, Circle, AlertCircle, Kanban } from "lucide-react"
import { apiService } from "@/lib/api"
import type { Task, User } from "@/lib/types"
import { UserDropdown } from "@/components/profile/assign-user"
import { motion, AnimatePresence } from "framer-motion"
import { TaskCard } from "@/components/task/task-card"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile" // Using the provided hook

interface TasksTabProps {
  eventId: string
  t: (key: string) => string
}

export function TasksTab({ eventId, t }: TasksTabProps) {
  const isMobile = useIsMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newAssignedTo, setNewAssignedTo] = useState<string | undefined>()
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const statusConfig = useMemo(
    () => ({
      PENDING: {
        label: t("Pending"),
        icon: Circle,
        dotColor: "bg-orange-500",
        badgeColor: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        progressColor: "bg-orange-500",
      },
      IN_PROGRESS: {
        label: t("In Progress"),
        icon: Clock,
        dotColor: "bg-blue-500",
        badgeColor: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        progressColor: "bg-blue-500",
      },
      DONE: {
        label: t("Done"),
        icon: CheckCircle2,
        dotColor: "bg-green-500",
        badgeColor: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
        progressColor: "bg-green-500",
      },
    }),
    [t],
  )

  const loadTasks = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setError(null)
    try {
      const [eventTasks, allUsers] = await Promise.all([apiService.getTasksForEvent(eventId), apiService.getUsers()])
      setTasks(eventTasks)
      setUsers(allUsers)
    } catch (err: any) {
      setError(err.message || t("Failed to load tasks"))
    } finally {
      setLoading(false)
    }
  }, [eventId, t])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const tasksByStatus = useMemo(
    () => ({
      PENDING: tasks.filter((t) => t.status === "PENDING"),
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
      DONE: tasks.filter((t) => t.status === "DONE"),
    }),
    [tasks],
  )

  const handleCreateTask = async () => {
    if (!newTitle.trim()) {
      alert(t("Please enter a task title"))
      return
    }
    setIsCreating(true)
    try {
      const dto = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        assignedToId: newAssignedTo,
      }
      const createdTask = await apiService.inviteUserToTask(eventId, dto)
      setTasks((prev) => [...prev, createdTask])
      setNewTitle("")
      setNewDescription("")
      setNewAssignedTo(undefined)
    } catch (err: any) {
      alert(err.message || t("Failed to create task"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, newStatus: Task["status"]) => {
      setIsUpdatingStatus(true)
      try {
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
        await apiService.updateTaskStatus(taskId, newStatus)
      } catch (err: any) {
        setError(err.message || t("Failed to update task status"))
      } finally {
        setIsUpdatingStatus(false)
      }
    },
    [t],
  )

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 min-h-screen">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-6">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-base">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <main className="space-y-8 p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Create Task */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg border rounded-xl bg-white dark:bg-gray-900">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                  <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
                    {t("Create New Task")}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {t("Add a new task and assign it to a team member")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="task-title"
                      className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >
                      {t("Task Title")}
                    </label>
                    <Input
                      id="task-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={t("Enter task title...")}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="task-desc"
                      className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >
                      {t("Description")}
                    </label>
                    <Textarea
                      id="task-desc"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder={t("Task description...")}
                      className="w-full h-28 resize-y"
                    />
                  </div>
                </div>
                <div className="space-y-5 flex flex-col justify-between">
                  <div>
                    <label
                      htmlFor="assign-to"
                      className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >
                      {t("Assign To")}
                    </label>
                    <UserDropdown
                      id="assign-to"
                      users={users}
                      selectedUserId={newAssignedTo}
                      onUserSelect={setNewAssignedTo}
                      placeholder={t("Select team member...")}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleCreateTask}
                    disabled={isCreating || !newTitle.trim()}
                    className="w-full py-2.5 text-base sm:text-lg font-semibold mt-auto"
                  >
                    {isCreating ? t("Creating...") : t("Add Task")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kanban Board */}
        <div
          className={cn(
            isMobile
              ? "flex flex-col gap-4 mt-8" // Changed for vertical stacking on mobile
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8",
          )}
        >
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
            const config = statusConfig[status as keyof typeof statusConfig]
            const Icon = config.icon
            return (
              <Card
                key={status}
                className={cn(
                  "rounded-xl shadow-md border bg-white dark:bg-gray-900",
                  // Removed mobile-specific width/shrink/snap classes as they are for horizontal scroll
                )}
              >
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", config.dotColor)} />
                    <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-50">{config.label}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.badgeColor)}>
                      {statusTasks.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="min-h-[180px] max-h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 dark:bg-gray-950 rounded-b-xl">
                  <AnimatePresence initial={false}>
                    {statusTasks.length > 0 ? (
                      statusTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleUpdateTaskStatus}
                          t={t}
                          statusConfig={statusConfig}
                        />
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full"
                      >
                        <Kanban className="h-8 w-8 mb-3 opacity-50 text-gray-400 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("No tasks in this column yet.")}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
