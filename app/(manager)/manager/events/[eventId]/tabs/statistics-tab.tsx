"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import type { Event, Task, User, CostItem, EventSeries, Notification } from "@/lib/types"
import {
  Loader2,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserIcon,
  CalendarIcon,
  Trophy,
  Target,
  Users,
  PieChart,
  RefreshCw,
  Bell,
  Activity,
  UserCheck,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface StatisticsTabProps {
  eventId: string
}

interface ComprehensiveEventData {
  event: Event | null
  eventSeries: EventSeries | null
  seriesEvents: Event[]
  tasks: Task[]
  participants: User[]
  organizers: User[]
  costItems: CostItem[]
  costTotal: { total: number; budget?: number; withinBudget: boolean } | null
  notifications: Notification[]
  unreadNotificationCount: number
  allUsers: User[]
  currentUser: User | null
  userParticipations: any[]
  myTasks: Task[]
  allTasks: Task[]
}

export default function StatisticsTab({ eventId }: StatisticsTabProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<ComprehensiveEventData>({
    event: null,
    eventSeries: null,
    seriesEvents: [],
    tasks: [],
    participants: [],
    organizers: [],
    costItems: [],
    costTotal: null,
    notifications: [],
    unreadNotificationCount: 0,
    allUsers: [],
    currentUser: null,
    userParticipations: [],
    myTasks: [],
    allTasks: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Starting comprehensive data fetch for event:", eventId)

      // Primary event data - critical for the dashboard
      const primaryDataPromises = [
        apiService.getEvent(eventId),
        apiService.getTasksForEvent(eventId),
        apiService.getEventParticipants(eventId),
        apiService.getEventCostItems(eventId),
        apiService.getEventCostTotal(eventId),
      ]

      // Secondary data - nice to have but not critical
      const secondaryDataPromises = [
        apiService.getCurrentUser(),
        apiService.getUsers(),
        apiService.getMyTasks(),
        apiService.getAllTasks(),
        apiService.getUserNotifications(50, 0),
        apiService.getUnreadNotificationCount(),
      ]

     
      const primaryResults = await Promise.allSettled(primaryDataPromises)


      const secondaryResults = await Promise.allSettled(secondaryDataPromises)

      // Process primary results
      const [eventResult, tasksResult, participantsResult, costItemsResult, costTotalResult] = primaryResults

      if (eventResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, event: eventResult.value }))
   

        // Fetch event series data if available 
        if (eventResult.value.EventSeriesId) {
          try {
   
            const seriesData = await apiService.getEventSeriesById(eventResult.value.EventSeriesId)
            setData((prev) => ({
              ...prev,
              eventSeries: seriesData,
              seriesEvents: seriesData.events
                ? [...seriesData.events].sort(
                    (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                : [],
            }))
           
          } catch (seriesError) {
          console.log(seriesError.message)
          }
        }
      } else {
        throw new Error("Failed to load event data")
      }

      // Process other primary results
      if (tasksResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, tasks: tasksResult.value }))
        console.log("[v0] Tasks loaded:", tasksResult.value.length)
      }

      if (participantsResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, participants: participantsResult.value }))
        console.log("[v0] Participants loaded:", participantsResult.value.length)
      }

      if (costItemsResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, costItems: costItemsResult.value }))
        console.log("[v0] Cost items loaded:", costItemsResult.value.length)
      }

      if (costTotalResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, costTotal: costTotalResult.value }))
        console.log("[v0] Cost total loaded:", costTotalResult.value.total)
      }

      // Process secondary results
      const [currentUserResult, usersResult, myTasksResult, allTasksResult, notificationsResult, unreadCountResult] =
        secondaryResults

      if (currentUserResult.status === "fulfilled" && currentUserResult.value) {
        setData((prev) => ({ ...prev, currentUser: currentUserResult.value }))
        console.log("[v0] Current user loaded:", currentUserResult.value.username)

        // Fetch user participations
        try {
          const participations = await apiService.getUserParticipations(currentUserResult.value.id)
          setData((prev) => ({ ...prev, userParticipations: participations }))
          console.log("[v0] User participations loaded:", participations.length)
        } catch (participationError) {
          console.warn("[v0] Failed to load user participations:", participationError)
        }
      }

      if (usersResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, allUsers: usersResult.value }))
        console.log("[v0] All users loaded:", usersResult.value.length)
      }

      if (myTasksResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, myTasks: myTasksResult.value }))
        console.log("[v0] My tasks loaded:", myTasksResult.value.length)
      }

      if (allTasksResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, allTasks: allTasksResult.value }))
        console.log("[v0] All tasks loaded:", allTasksResult.value.length)
      }

      if (notificationsResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, notifications: notificationsResult.value.data || [] }))
        console.log("[v0] Notifications loaded:", notificationsResult.value.data?.length || 0)
      }

      if (unreadCountResult.status === "fulfilled") {
        setData((prev) => ({ ...prev, unreadNotificationCount: unreadCountResult.value }))
        console.log("[v0] Unread notifications:", unreadCountResult.value)
      }

      console.log("[v0] Comprehensive data fetch completed successfully")
    } catch (err: any) {
      console.error("[v0] Error loading comprehensive statistics:", err)
      setError(err.message || "Failed to load event statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchComprehensiveData()
    }
  }, [eventId, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin h-5 w-5" />
          <span className="text-lg">{t("statistics.loading")}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-medium">{error}</div>
          <p className="text-muted-foreground">{t("statistics.error.subtitle")}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t("statistics.error.retry")}
          </button>
        </div>
      </div>
    )
  }

  if (!data.event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-muted-foreground text-lg">{t("statistics.noData")}</div>
        </div>
      </div>
    )
  }

  const analytics = calculateComprehensiveAnalytics(data)

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("statistics.title")}</h1>
            <p className="text-muted-foreground text-lg">
              {t("statistics.subtitle", { eventTitle: data.event.title })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {data.unreadNotificationCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {t("statistics.badges.unread", { count: data.unreadNotificationCount })}
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {data.event.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <OverviewCard
            icon={<Users className="h-5 w-5" />}
            label={t("statistics.overview.totalParticipants")}
            value={analytics.totalParticipants.toString()}
            subtitle={t("statistics.overview.participantGrowth", {
              growth:
                analytics.participantGrowth >= 0 ? "+" + analytics.participantGrowth : analytics.participantGrowth,
            })}
            trend={analytics.participantGrowth >= 0 ? "positive" : "negative"}
          />
          <OverviewCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label={t("statistics.overview.taskCompletion")}
            value={`${analytics.taskCompletionRate}%`}
            subtitle={t("statistics.overview.tasksCompleted", {
              completed: analytics.completedTasks,
              total: analytics.totalTasks,
            })}
            trend={
              analytics.taskCompletionRate >= 70
                ? "positive"
                : analytics.taskCompletionRate >= 40
                  ? "neutral"
                  : "negative"
            }
          />
          <OverviewCard
            icon={<DollarSign className="h-5 w-5" />}
            label={t("statistics.overview.budgetStatus")}
            value={`${analytics.budgetUtilization}%`}
            subtitle={t("statistics.overview.budgetUsed", {
              actual: analytics.actualBudget.toLocaleString(),
              planned: analytics.plannedBudget.toLocaleString(),
            })}
            trend={analytics.budgetVariancePercent >= 0 ? "positive" : "negative"}
          />
          <OverviewCard
            icon={<Bell className="h-5 w-5" />}
            label={t("statistics.overview.notifications")}
            value={data.notifications.length.toString()}
            subtitle={t("statistics.overview.notificationsUnread", { count: data.unreadNotificationCount })}
            trend={data.unreadNotificationCount === 0 ? "positive" : "neutral"}
          />
          <OverviewCard
            icon={<CalendarIcon className="h-5 w-5" />}
            label={t("statistics.overview.daysUntilEvent")}
            value={analytics.daysUntilEvent.toString()}
            subtitle={
              analytics.daysUntilEvent > 0
                ? t("statistics.overview.daysRemaining")
                : t("statistics.overview.eventPassed")
            }
            trend={analytics.daysUntilEvent > 7 ? "positive" : analytics.daysUntilEvent > 0 ? "neutral" : "negative"}
          />
          <OverviewCard
            icon={<Target className="h-5 w-5" />}
            label={t("statistics.overview.capacityFill")}
            value={`${analytics.capacityFillRate}%`}
            subtitle={t("statistics.overview.capacityUsed", {
              current: analytics.totalParticipants,
              max: data.event.maxCapacity || "unlimited",
            })}
            trend={
              analytics.capacityFillRate >= 80 ? "positive" : analytics.capacityFillRate >= 50 ? "neutral" : "negative"
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TaskMetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("statistics.tasks.completedTasks")}
          value={analytics.completedTasks}
          total={analytics.totalTasks}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <TaskMetricCard
          icon={<Clock className="h-5 w-5" />}
          label={t("statistics.tasks.inProgress")}
          value={analytics.inProgressTasks}
          total={analytics.totalTasks}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <TaskMetricCard
          icon={<AlertCircle className="h-5 w-5" />}
          label={t("statistics.tasks.pendingTasks")}
          value={analytics.pendingTasks}
          total={analytics.totalTasks}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <TaskMetricCard
          icon={<Users className="h-5 w-5" />}
          label={t("statistics.tasks.assignedUsers")}
          value={analytics.totalAssignedUsers}
          total={data.allUsers.length}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5 text-primary" />
              {t("statistics.budget.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <BudgetMetric
                  label={t("statistics.budget.planned")}
                  value={analytics.plannedBudget}
                  color="text-blue-600"
                  icon={<Target className="h-4 w-4" />}
                />
                <BudgetMetric
                  label={t("statistics.budget.actual")}
                  value={analytics.actualBudget}
                  color="text-green-600"
                 
                />
                <BudgetMetric
                  label={t("statistics.budget.remaining")}
                  value={analytics.remainingBudget}
                  color={analytics.remainingBudget >= 0 ? "text-green-600" : "text-red-600"}
                  icon={
                    analytics.remainingBudget >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Budget Utilization</span>
                  <span className="text-sm text-muted-foreground">{analytics.budgetUtilization}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      analytics.budgetUtilization <= 100 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(analytics.budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Cost Breakdown</h4>
                {analytics.costBreakdown.map((category, i) => (
                  <CostBreakdownItem
                    key={category.category}
                    category={category.category}
                    amount={category.amount}
                    percentage={category.percentage}
                    colorIndex={i}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              {t("statistics.participants.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <EngagementMetric
                  label="Active Users"
                  value={analytics.activeUsers}
                  icon={<UserCheck className="h-4 w-4" />}
                  color="text-green-600"
                />
                <EngagementMetric
                  label="New Participants"
                  value={analytics.newParticipants}
                  icon={<UserPlus className="h-4 w-4" />}
                  color="text-blue-600"
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Role Distribution</h4>
                {analytics.roleDistribution.map((role, i) => (
                  <RoleDistributionItem
                    key={role.role}
                    role={role.role}
                    count={role.count}
                    total={analytics.totalParticipants}
                    colorIndex={i}
                  />
                ))}
              </div>

              {analytics.jobDistribution.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Job Distribution</h4>
                  {analytics.jobDistribution.slice(0, 5).map((job, i) => (
                    <JobDistributionItem
                      key={job.job}
                      job={job.job}
                      count={job.count}
                      total={analytics.totalParticipants}
                      colorIndex={i}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {data.tasks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <PieChart className="h-5 w-5 text-primary" />
                {t("statistics.tasks.statusDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.taskStatusDistribution
                  .filter((status) => status.count > 0)
                  .map((status, i) => (
                    <TaskStatusDistributionItem
                      key={status.status}
                      status={status.status}
                      count={status.count}
                      total={analytics.totalTasks}
                      colorIndex={i}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-5 w-5 text-primary" />
                {t("statistics.tasks.topContributors")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topContributors.length > 0 ? (
                  analytics.topContributors.map((contributor, i) => (
                    <TopContributorItem
                      key={contributor.name}
                      name={contributor.name}
                      completedTasks={contributor.completedTasks}
                      totalTasks={contributor.totalTasks}
                      rank={i + 1}
                      maxCompleted={analytics.topContributors[0]?.completedTasks || 1}
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t("statistics.tasks.noAssignments")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {data.tasks.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {t("statistics.tasks.timeline")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.tasks.map((task) => (
                <ComprehensiveTaskItem key={task.id} task={task} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.seriesEvents.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Series Participation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-center gap-3 h-48 px-4">
                {analytics.seriesTrends.map((trend, i) => (
                  <TrendBar
                    key={i}
                    label={trend.label}
                    value={trend.participants}
                    maxValue={analytics.maxSeriesParticipants}
                    index={i}
                  />
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Showing participation across {data.seriesEvents.length} events in the series
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.notifications.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-5 w-5 text-primary" />
              {t("statistics.communication.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NotificationMetric
                  label={t("statistics.communication.totalNotifications")}
                  value={data.notifications.length}
                  icon={<Bell className="h-4 w-4" />}
                />
                <NotificationMetric
                  label={t("statistics.communication.unread")}
                  value={data.unreadNotificationCount}
                  icon={<AlertCircle className="h-4 w-4" />}
                />
                <NotificationMetric
                  label={t("statistics.communication.readRate")}
                  value={`${analytics.notificationReadRate}%`}
                  icon={<Eye className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">{t("statistics.communication.recentNotifications")}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.notifications.slice(0, 10).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function calculateComprehensiveAnalytics(data: ComprehensiveEventData) {
  const totalParticipants = data.participants.length
  const totalTasks = data.tasks.length
  const completedTasks = data.tasks.filter((t) => t.status === "DONE").length
  const inProgressTasks = data.tasks.filter((t) => t.status === "IN_PROGRESS").length
  const pendingTasks = data.tasks.filter((t) => t.status === "PENDING" || t.status === "TODO").length
  const acceptedTasks = data.tasks.filter((t) => t.status === "ACCEPTED").length

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const totalAssignedUsers = new Set(data.tasks.flatMap((t) => t.assignedUsers?.map((u) => u.id) || [])).size

  const plannedBudget = data.event?.budget || 0
  const actualBudget =
    data.costTotal?.total || data.costItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const remainingBudget = plannedBudget - actualBudget
  const budgetUtilization = plannedBudget > 0 ? Math.round((actualBudget / plannedBudget) * 100) : 0
  const budgetVariancePercent = plannedBudget > 0 ? (remainingBudget / plannedBudget) * 100 : 0

  const capacityFillRate = data.event?.maxCapacity ? Math.round((totalParticipants / data.event.maxCapacity) * 100) : 0

  const daysUntilEvent = data.event
    ? Math.ceil((new Date(data.event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Series analytics
  const seriesAvgParticipants =
    data.seriesEvents.length > 0
      ? data.seriesEvents.reduce((sum, e) => sum + (e.participants?.length || 0), 0) / data.seriesEvents.length
      : 0
  const participantGrowth =
    seriesAvgParticipants > 0
      ? Math.round(((totalParticipants - seriesAvgParticipants) / seriesAvgParticipants) * 100)
      : 0

  // Cost breakdown
  const costBreakdown = data.costItems.reduce(
    (acc, item) => {
      const category = item.label.split(" ")[0] || "Other"
      const existing = acc.find((c) => c.category === category)
      const amount = item.price * item.quantity

      if (existing) {
        existing.amount += amount
      } else {
        acc.push({ category, amount, percentage: 0 })
      }
      return acc
    },
    [] as { category: string; amount: number; percentage: number }[],
  )

  costBreakdown.forEach((item) => {
    item.percentage = actualBudget > 0 ? Math.round((item.amount / actualBudget) * 100) : 0
  })

  // User analytics
  const activeUsers = data.participants.filter((p) => p.status === "confirmed").length
  const newParticipants = data.participants.filter((p) => {
    // Assuming users created in the last 30 days are "new"
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(p.createdAt || 0) > thirtyDaysAgo
  }).length

  // Role distribution
  const roleDistribution = data.participants.reduce(
    (acc, p) => {
      const role = p.role || "participant"
      const existing = acc.find((r) => r.role === role)
      if (existing) {
        existing.count++
      } else {
        acc.push({ role, count: 1 })
      }
      return acc
    },
    [] as { role: string; count: number }[],
  )

  // Job distribution
  const jobDistribution = data.participants
    .reduce(
      (acc, p) => {
        if (p.job) {
          const existing = acc.find((j) => j.job === p.job)
          if (existing) {
            existing.count++
          } else {
            acc.push({ job: p.job, count: 1 })
          }
        }
        return acc
      },
      [] as { job: string; count: number }[],
    )
    .sort((a, b) => b.count - a.count)

  // Task status distribution
  const taskStatusDistribution = [
    { status: "DONE", count: completedTasks },
    { status: "IN_PROGRESS", count: inProgressTasks },
    { status: "PENDING", count: pendingTasks },
    { status: "TODO", count: data.tasks.filter((t) => t.status === "TODO").length },
    { status: "ACCEPTED", count: acceptedTasks },
    { status: "REJECTED", count: data.tasks.filter((t) => t.status === "REJECTED").length },
  ]

  // Top contributors
  const contributorStats: Record<string, { name: string; completedTasks: number; totalTasks: number }> = {}
  data.tasks.forEach((task) => {
    task.assignedUsers?.forEach((user) => {
      if (!contributorStats[user.id]) {
        contributorStats[user.id] = { name: user.username, completedTasks: 0, totalTasks: 0 }
      }
      contributorStats[user.id].totalTasks++
      if (task.status === "DONE") {
        contributorStats[user.id].completedTasks++
      }
    })
  })

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.completedTasks - a.completedTasks)
    .slice(0, 5)

  // Series trends
  const seriesTrends = data.seriesEvents.map((e) => ({
    label: e.title,
    participants: e.participants?.length || 0,
  }))

  const maxSeriesParticipants = Math.max(...seriesTrends.map((t) => t.participants), 1)

  // Notification analytics
  const readNotifications = data.notifications.filter((n) => n.isRead).length
  const notificationReadRate =
    data.notifications.length > 0 ? Math.round((readNotifications / data.notifications.length) * 100) : 0

  return {
    totalParticipants,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    acceptedTasks,
    taskCompletionRate,
    totalAssignedUsers,
    plannedBudget,
    actualBudget,
    remainingBudget,
    budgetUtilization,
    budgetVariancePercent,
    capacityFillRate,
    daysUntilEvent,
    participantGrowth,
    costBreakdown,
    activeUsers,
    newParticipants,
    roleDistribution,
    jobDistribution,
    taskStatusDistribution,
    topContributors,
    seriesTrends,
    maxSeriesParticipants,
    notificationReadRate,
  }
}

interface OverviewCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
  trend: "positive" | "negative" | "neutral"
}

function OverviewCard({ icon, label, value, subtitle, trend }: OverviewCardProps) {
  const trendColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  }

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-primary">{icon}</div>
          <div className={`text-xs font-medium ${trendColors[trend]}`}>
            {trend === "positive" ? "↗" : trend === "negative" ? "↘" : "→"}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TaskMetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  total: number
  color: string
  bgColor: string
  isPercentage?: boolean
}

function TaskMetricCard({ icon, label, value, total, color, bgColor, isPercentage = false }: TaskMetricCardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {value}
              {isPercentage ? "%" : ""}
            </div>
            <div className="text-xs text-muted-foreground">
              {!isPercentage && total > 0 && `${percentage.toFixed(0)}%`}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {!isPercentage && total > 0 && (
            <div className="mt-2 w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${color.replace("text-", "bg-")}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
          {isPercentage && (
            <div className="mt-2 w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${color.replace("text-", "bg-")}`}
                style={{ width: `${value}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface BudgetMetricProps {
  label: string
  value: number
  color: string
  icon: React.ReactNode
}

function BudgetMetric({ label, value, color, icon }: BudgetMetricProps) {
  return (
    <div className="text-center space-y-2">
      <div className={`${color} flex items-center justify-center gap-1`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold">${value.toLocaleString()}</div>
    </div>
  )
}

interface CostBreakdownItemProps {
  category: string
  amount: number
  percentage: number
  colorIndex: number
}

function CostBreakdownItem({ category, amount, percentage, colorIndex }: CostBreakdownItemProps) {
  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
  const color = colors[colorIndex % colors.length]

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-medium">{category}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">${amount.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{percentage}%</div>
      </div>
    </div>
  )
}

interface EngagementMetricProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function EngagementMetric({ label, value, icon, color }: EngagementMetricProps) {
  return (
    <div className="text-center space-y-2">
      <div className={`${color} flex items-center justify-center gap-1`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

interface RoleDistributionItemProps {
  role: string
  count: number
  total: number
  colorIndex: number
}

function RoleDistributionItem({ role, count, total, colorIndex }: RoleDistributionItemProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
  const color = colors[colorIndex % colors.length]

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium capitalize">{role}</span>
        <span className="text-sm text-muted-foreground">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface JobDistributionItemProps {
  job: string
  count: number
  total: number
  colorIndex: number
}

function JobDistributionItem({ job, count, total, colorIndex }: JobDistributionItemProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
  const color = colors[colorIndex % colors.length]

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{job}</span>
        <span className="text-sm text-muted-foreground">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface TaskStatusDistributionItemProps {
  status: string
  count: number
  total: number
  colorIndex: number
}

function TaskStatusDistributionItem({ status, count, total, colorIndex }: TaskStatusDistributionItemProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  const colors = ["bg-green-500", "bg-amber-500", "bg-blue-500", "bg-gray-500", "bg-indigo-500", "bg-red-500"]
  const color = colors[colorIndex % colors.length]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-indigo-600" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="text-sm font-medium capitalize">{status.replace("_", " ").toLowerCase()}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface TopContributorItemProps {
  name: string
  completedTasks: number
  totalTasks: number
  rank: number
  maxCompleted: number
}

function TopContributorItem({ name, completedTasks, totalTasks, rank, maxCompleted }: TopContributorItemProps) {
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const relativeWidth = maxCompleted > 0 ? (completedTasks / maxCompleted) * 100 : 0

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getRankIcon(rank)}</span>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold">{completedTasks}</span>
          <span className="text-xs text-muted-foreground ml-1">
            / {totalTasks} ({completionRate.toFixed(0)}%)
          </span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${relativeWidth}%` }}
        />
      </div>
    </div>
  )
}

interface TrendBarProps {
  label: string
  value: number
  maxValue: number
  index: number
}

function TrendBar({ label, value, maxValue, index }: TrendBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
  const color = colors[index % colors.length]

  return (
    <div className="flex flex-col items-center space-y-2 min-w-0 flex-1">
      <div className="w-full max-w-12 h-full bg-muted rounded-t-lg relative overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 ${color} rounded-t-lg transition-all duration-700 ease-out`}
          style={{ height: `${percentage}%` }}
        />
      </div>
      <div className="text-center min-w-0">
        <p className="text-xs font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground truncate max-w-16" title={label}>
          {label}
        </p>
      </div>
    </div>
  )
}

interface NotificationMetricProps {
  label: string
  value: number | string
  icon: React.ReactNode
}

function NotificationMetric({ label, value, icon }: NotificationMetricProps) {
  return (
    <div className="text-center space-y-2">
      <div className="text-primary flex items-center justify-center gap-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
}

function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div className={`p-2 rounded border ${notification.isRead ? "bg-muted/50" : "bg-background border-primary/20"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{notification.title}</p>
          <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
          <span className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

interface ComprehensiveTaskItemProps {
  task: Task
}

function ComprehensiveTaskItem({ task }: ComprehensiveTaskItemProps) {
  const { t } = useTranslation()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800 border-green-200"
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="font-semibold text-sm">{task.title}</h4>
            <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
              {t(`statistics.tasks.status.${task.status.toLowerCase().replace("_", "")}`)}
            </Badge>
      <Badge variant="outline" >
  {task.id}
</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("statistics.tasks.progress")}</span>
            <span className="font-medium">{task.progress || 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <UserIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("statistics.tasks.assigned", { count: task.assignedUsers?.length || 0 })}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("statistics.tasks.due", { date: new Date(task.dueDate).toLocaleDateString() })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {task.assignedUsers && task.assignedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          {task.assignedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="text-xs">
              {user.username}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t text-xs">
        <div>
          <span className="text-muted-foreground">{t("statistics.tasks.created")}</span>
          <div className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">{t("statistics.tasks.updated")}</span>
          <div className="font-medium">{new Date(task.updatedAt).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="text-muted-foreground">{t("statistics.tasks.assignedBy")}</span>
          <div className="font-medium">{task.assignedBy?.name || t("statistics.tasks.system")}</div>
        </div>
        <div>
          <span className="text-muted-foreground">{t("statistics.tasks.event")}</span>
          <div className="font-medium truncate">{task.event.title}</div>
        </div>
      </div>
    </div>
  )
}

