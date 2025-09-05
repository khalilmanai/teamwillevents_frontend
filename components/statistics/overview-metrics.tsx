"use client"

import { Badge } from "@/components/ui/badge"
import { Bell, Activity, Users, CheckCircle2, DollarSign, CalendarIcon, Target } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { OverviewCard } from "./overview-card"

interface OverviewMetricsProps {
  data: any
  analytics: any
}

export function OverviewMetrics({ data, analytics }: OverviewMetricsProps) {
  const { t } = useTranslation()

  console.log("[v0] Analytics data:", analytics)
  console.log("[v0] Event data:", data)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("statistics.title")}</h1>
          <p className="text-foreground text-lg">{data.event?.title || t("statistics.noEventTitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          {data.unreadNotificationCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {t("statistics.badges.unread")} {data.unreadNotificationCount}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {data.event?.status || t("statistics.noStatus")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <OverviewCard
          icon={<Users className="h-5 w-5" />}
          label={t("statistics.overview.totalParticipants")}
          value={analytics.totalParticipants?.toString() || "0"}
          subtitle={t("statistics.overview.participantGrowth", {
            growth: analytics.participantGrowth >= 0 ? "+" + analytics.participantGrowth : analytics.participantGrowth,
          })}
          trend={analytics.participantGrowth >= 0 ? "positive" : "negative"}
        />
        <OverviewCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t("statistics.overview.taskCompletion")}
          value={`${analytics.taskCompletionRate || 0}%`}
          subtitle={t("statistics.overview.tasksCompleted", {
            completed: analytics.completedTasks || 0,
            total: analytics.totalTasks || 0,
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
          value={`${analytics.budgetUtilization || 0}%`}
          subtitle={t("statistics.overview.budgetUsed", {
            actual: analytics.actualBudget || 0,
            planned: analytics.plannedBudget || 0,
          })}
          trend={analytics.budgetVariancePercent >= 0 ? "positive" : "negative"}
        />
        <OverviewCard
          icon={<Bell className="h-5 w-5" />}
          label={t("statistics.overview.notifications")}
          value={data.notifications?.length?.toString() || "0"}
          subtitle={t("statistics.overview.notificationsUnread", { count: data.unreadNotificationCount || 0 })}
          trend={data.unreadNotificationCount === 0 ? "positive" : "neutral"}
        />
        <OverviewCard
          icon={<CalendarIcon className="h-5 w-5" />}
          label={t("statistics.overview.daysUntilEvent")}
          value={analytics.daysUntilEvent?.toString() || "0"}
          subtitle={
            analytics.daysUntilEvent > 0 ? t("statistics.overview.daysRemaining") : t("statistics.overview.eventPassed")
          }
          trend={analytics.daysUntilEvent > 7 ? "positive" : analytics.daysUntilEvent > 0 ? "neutral" : "negative"}
        />
        <OverviewCard
          icon={<Target className="h-5 w-5" />}
          label={t("statistics.overview.capacityFill")}
          value={`${analytics.capacityFillRate || 0}%`}
          subtitle={t("statistics.overview.capacityUsed", {
            current: analytics.totalParticipants || 0,
            max: data.event?.maxCapacity || t("statistics.unlimited"),
          })}
          trend={
            analytics.capacityFillRate >= 80 ? "positive" : analytics.capacityFillRate >= 50 ? "neutral" : "negative"
          }
        />
      </div>
    </div>
  )
}
