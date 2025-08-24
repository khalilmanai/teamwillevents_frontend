"use client"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Circle, Clock, CheckCircle2, AlertCircle, RefreshCw, Handshake, XCircle, Kanban } from "lucide-react"
import { apiService } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"
import type { Task, User } from "@/lib/types"
import { EmployeeTaskCard } from "./task-card"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatePresence } from "framer-motion"

export default function EmployeeTasksTab() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")

  const statusConfig = useMemo(
    () => ({
      PENDING: { label: t("Pending Invitation"), icon: Handshake, dotColor: "theme-yellow-dot", badgeColor: "theme-yellow-badge", badgeVariant: "secondary" as const, bgColor: "theme-yellow-bg" },
      ACCEPTED: { label: t("Accepted"), icon: CheckCircle2, dotColor: "theme-green-dot", badgeColor: "theme-green-badge", badgeVariant: "default" as const, bgColor: "theme-green-bg" },
      REJECTED: { label: t("Rejected"), icon: XCircle, dotColor: "theme-red-dot", badgeColor: "theme-red-badge", badgeVariant: "destructive" as const, bgColor: "theme-red-bg" },
      TODO: { label: t("To Do"), icon: Circle, dotColor: "theme-slate-dot", badgeColor: "theme-slate-badge", badgeVariant: "secondary" as const, bgColor: "theme-slate-bg" },
      IN_PROGRESS: { label: t("In Progress"), icon: Clock, dotColor: "theme-blue-dot", badgeColor: "theme-blue-badge", badgeVariant: "default" as const, bgColor: "theme-blue-bg" },
      DONE: { label: t("Done"), icon: CheckCircle2, dotColor: "theme-green-dark-dot", badgeColor: "theme-green-dark-badge", badgeVariant: "default" as const, bgColor: "theme-green-dark-bg" },
    }),
    [t]
  )

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let user = currentUser
      if (!user) {
        user = await apiService.getCurrentUser()
        if (!user) throw new Error("Failed to fetch current user")
        setCurrentUser(user)
      }
      const data = await apiService.getMyTasks()
      setTasks(data)
    } catch (err: any) {
      setError(err?.message || t("Failed to load tasks"))
      toast({ title: t("Error"), description: err?.message, variant: "destructive" })
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [currentUser, t, toast])

  useEffect(() => { loadTasks() }, [loadTasks])

  const handleInvitationResponse = async (taskId: string, response: "ACCEPTED" | "REJECTED") => {
    setUpdatingTaskId(taskId)
    try {
      const updatedTask = await apiService.respondToTask(taskId, response)
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
      toast({ title: t("Success"), description: response === "ACCEPTED" ? t("You accepted the task") : t("You rejected the task") })
    } catch (err: any) {
      toast({ title: t("Error"), description: err?.message, variant: "destructive" })
    } finally { setUpdatingTaskId(null) }
  }

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const currentTask = tasks.find(t => t.id === taskId)
    const currentStatusLabel = currentTask ? statusConfig[currentTask.status].label : ""
    const newStatusLabel = statusConfig[status].label

    setUpdatingTaskId(taskId)
    try {
      const updatedTask = await apiService.updateTaskStatus(taskId, status as "TODO" | "IN_PROGRESS" | "DONE")
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
      toast({ title: t("Success"), description: t("Task status updated from {currentStatus} to {newStatus}", { currentStatus: currentStatusLabel, newStatus: newStatusLabel }) })
    } catch (err: any) {
      toast({ title: t("Error"), description: err?.message, variant: "destructive" })
    } finally { setUpdatingTaskId(null) }
  }

  const filteredTasks = useMemo(() => selectedStatusFilter === "ALL" ? tasks : tasks.filter(t => t.status === selectedStatusFilter), [tasks, selectedStatusFilter])
  const allStatuses: (Task["status"] | "ALL")[] = ["ALL", "PENDING", "ACCEPTED", "TODO", "IN_PROGRESS", "DONE", "REJECTED"]

  if (loading) return (
    <div className="space-y-6 p-4 sm:p-6 min-h-screen">
      <Card className="shadow-lg rounded-xl theme-card-filled animate-pulse">
        <CardHeader className="pb-4 border-b theme-border-muted">
          <div className="h-8 w-1/2 theme-bg-muted rounded" />
          <div className="h-4 w-3/4 theme-bg-muted rounded mt-2" />
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="h-[120px] w-full theme-bg-muted rounded" />
          <div className="h-[120px] w-full theme-bg-muted rounded" />
          <div className="h-[120px] w-full theme-bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  )

  if (error) return (
    <div className="max-w-xl mx-auto mt-6">
      <div className="flex items-center justify-center p-4 rounded-lg theme-bg-error theme-text-error">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p className="text-base">{error}</p>
      </div>
    </div>
  )

  return (
    <main className="space-y-8 p-4 sm:p-6 min-h-screen theme-bg-main">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg rounded-xl theme-card-filled">
          <CardHeader className="pb-4 border-b theme-border-muted">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg sm:text-2xl font-bold theme-text-primary">{t("My Tasks")}</CardTitle>
                <CardDescription className="text-sm mt-1 theme-text-muted">{t("Manage your task invitations and progress")}</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] theme-select-trigger">
                    <SelectValue placeholder={t("Filter by status")} />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === "ALL" ? t("All Tasks") : statusConfig[status as Task["status"]].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={loadTasks} variant="outline" size="sm" disabled={loading} className="w-full sm:w-auto theme-button-outline">
                  <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                  {t("Refresh")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 theme-text-muted flex flex-col items-center justify-center">
                <Kanban className="h-16 w-16 mb-6 opacity-50 theme-icon-muted" />
                <p className="text-lg mb-2">{t("No tasks found for this filter.")}</p>
                <p className="text-sm">{t("Try changing the filter or refresh the page.")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, index) => (
                    <div key={task.id} className="w-full" style={{ animationDelay: `${index * 100}ms` }}>
                      <EmployeeTaskCard
                        task={task}
                        onInvitationResponse={handleInvitationResponse}
                        onStatusChange={handleStatusChange}
                        t={t}
                        statusConfig={statusConfig}
                        isUpdating={updatingTaskId === task.id}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
