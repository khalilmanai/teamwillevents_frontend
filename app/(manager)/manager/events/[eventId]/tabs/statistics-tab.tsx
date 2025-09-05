"use client"

import { useEffect, useState } from "react"
import { Loader2, RefreshCw, BarChart2 } from "lucide-react"
import { apiService } from "@/lib/api"
import type { Event, Task, User, CostItem, EventSeries, Notification } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { OverviewMetrics } from "@/components/statistics/overview-metrics"
import { TaskMetricsGrid } from "@/components/statistics/task-metrics-grid"
import { BudgetOverview } from "@/components/statistics/budget-overview"
import { TaskDistributionChart } from "@/components/statistics/task-distribution-chart"
import { BudgetBreakdownChart } from "@/components/statistics/budget-breakdown-chart"
import { TaskProgressTimeline } from "@/components/statistics/task-progress-timeline"

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

      const primaryDataPromises = [
        apiService.getEvent(eventId),
        apiService.getTasksForEvent(eventId),
        apiService.getEventParticipants(eventId),
        apiService.getEventCostItems(eventId),
        apiService.getEventCostTotal(eventId),
      ]

      const secondaryDataPromises = [
        apiService.getCurrentUser(),
        apiService.getUsers(),
        apiService.getMyTasks(),
        apiService.getAllTasks(),
        apiService.getUserNotifications(50, 0),
      ]

      const [event, tasks, participants, costItems, costTotal] = await Promise.allSettled(primaryDataPromises)

      console.log("[v0] Primary data results:", {
        event: event.status === "fulfilled" ? event.value : null,
        tasks: tasks.status === "fulfilled" ? tasks.value : [],
        participants: participants.status === "fulfilled" ? participants.value : [],
        costItems: costItems.status === "fulfilled" ? costItems.value : [],
        costTotal: costTotal.status === "fulfilled" ? costTotal.value : null,
      })

      const [currentUser, allUsers, myTasks, allTasks, notifications] = await Promise.allSettled(secondaryDataPromises)

      let eventSeries = null
      let seriesEvents: Event[] = []
      if (event.status === "fulfilled" && event.value?.seriesId) {
        try {
          eventSeries = await apiService.getEventSeries(event.value.seriesId)
          seriesEvents = await apiService.getEventsInSeries(event.value.seriesId)
        } catch (seriesError) {
          console.warn("[v0] Failed to fetch event series data:", seriesError)
        }
      }

      const notificationData = notifications.status === "fulfilled" ? notifications.value : []
      const unreadCount = Array.isArray(notificationData)
        ? notificationData.filter((n: Notification) => !n.isRead).length
        : 0

      const comprehensiveData: ComprehensiveEventData = {
        event: event.status === "fulfilled" ? event.value : null,
        eventSeries,
        seriesEvents,
        tasks: tasks.status === "fulfilled" ? tasks.value : [],
        participants: participants.status === "fulfilled" ? participants.value : [],
        organizers: [],
        costItems: costItems.status === "fulfilled" ? costItems.value : [],
        costTotal: costTotal.status === "fulfilled" ? costTotal.value : null,
        notifications: notificationData,
        unreadNotificationCount: unreadCount,
        allUsers: allUsers.status === "fulfilled" ? allUsers.value : [],
        currentUser: currentUser.status === "fulfilled" ? currentUser.value : null,
        userParticipations: [],
        myTasks: myTasks.status === "fulfilled" ? myTasks.value : [],
        allTasks: allTasks.status === "fulfilled" ? allTasks.value : [],
      }

      console.log("[v0] Final comprehensive data:", comprehensiveData)
      setData(comprehensiveData)
    } catch (error) {
      console.error("[v0] Error fetching comprehensive data:", error)
      setError(error instanceof Error ? error.message : t("statistics.errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchComprehensiveData()
    }
  }, [eventId])

  const calculateComprehensiveAnalytics = (data: ComprehensiveEventData) => {
    const analytics = {
      totalParticipants: data.participants.length,
      participantGrowth: 0,
      totalTasks: data.tasks.length,
      completedTasks: data.tasks.filter((t) => t.status === "DONE").length,
      inProgressTasks: data.tasks.filter((t) => t.status === "IN_PROGRESS").length,
      pendingTasks: data.tasks.filter((t) => t.status === "PENDING" || t.status === "ACCEPTED").length,
      taskCompletionRate:
        data.tasks.length > 0
          ? Math.round((data.tasks.filter((t) => t.status === "DONE").length / data.tasks.length) * 100)
          : 0,
      totalAssignedUsers: new Set(data.tasks.flatMap((t) => t.assignedUsers?.map((u) => u.id) || [])).size,
      plannedBudget: data.costTotal?.budget || 0,
      actualBudget: data.costTotal?.total || 0,
      budgetVariance: (data.costTotal?.budget || 0) - (data.costTotal?.total || 0),
      budgetVariancePercent: data.costTotal?.budget
        ? Math.round(((data.costTotal.budget - data.costTotal.total) / data.costTotal.budget) * 100)
        : 0,
      budgetUtilization: data.costTotal?.budget ? Math.round((data.costTotal.total / data.costTotal.budget) * 100) : 0,
      daysUntilEvent: data.event?.date
        ? Math.ceil((new Date(data.event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      capacityFillRate: data.event?.maxCapacity
        ? Math.round((data.participants.length / data.event.maxCapacity) * 100)
        : 0,
      costBreakdown: data.costItems
        .reduce((acc: any[], item) => {
          const existing = acc.find((a) => a.category === item.category)
          if (existing) {
            existing.amount += item.amount
          } else {
            acc.push({ category: item.category, amount: item.amount })
          }
          return acc
        }, [])
        .map((item: any) => ({
          ...item,
          percentage: data.costTotal?.total ? (item.amount / data.costTotal.total) * 100 : 0,
        })),
    }

    return analytics
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4 animate-pulse">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
          <p className="text-lg text-gray-600">{t("statistics.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-6 bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-red-600 text-xl font-semibold">{t("statistics.errors.title")}</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => {
              setRetryCount((prev) => prev + 1)
              fetchComprehensiveData()
            }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            <RefreshCw className="h-5 w-5" />
            {t("statistics.retry")}
          </button>
        </div>
      </div>
    )
  }

  const analytics = calculateComprehensiveAnalytics(data)
  console.log("[v0] Calculated analytics:", analytics)
  console.log("[v0] Comprehensive data state:", data)

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen overflow-hidden">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("statistics.title")}</h2>
            <p className="text-sm text-gray-500">{t("statistics.subtitle")}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setRetryCount((prev) => prev + 1)
            fetchComprehensiveData()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
        >
          <RefreshCw className="h-4 w-4" />
          {t("statistics.refresh")}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <OverviewMetrics data={data} analytics={analytics} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TaskMetricsGrid analytics={analytics} data={data} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <TaskDistributionChart analytics={analytics} />
          <BudgetBreakdownChart analytics={analytics} />
          <TaskProgressTimeline analytics={analytics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetOverview analytics={analytics} data={data} />
        </div>
      </div>
    </div>
  )
}