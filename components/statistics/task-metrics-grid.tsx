"use client"

import { CheckCircle2, Clock, AlertCircle, Users } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TaskMetricCard } from "./task-metric-card"

interface TaskMetricsGridProps {
  analytics: any
  data: any
}

export function TaskMetricsGrid({ analytics, data }: TaskMetricsGridProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TaskMetricCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        label={t("statistics.tasks.completedTasks")}
        value={analytics.completedTasks || 0}
        total={analytics.totalTasks || 0}
        color="text-green-600"
        bgColor="bg-green-50"
      />
      <TaskMetricCard
        icon={<Clock className="h-5 w-5" />}
        label={t("statistics.tasks.inProgress")}
        value={analytics.inProgressTasks || 0}
        total={analytics.totalTasks || 0}
        color="text-amber-600"
        bgColor="bg-amber-50"
      />
      <TaskMetricCard
        icon={<AlertCircle className="h-5 w-5" />}
        label={t("statistics.tasks.pendingTasks")}
        value={analytics.pendingTasks || 0}
        total={analytics.totalTasks || 0}
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
      <TaskMetricCard
        icon={<Users className="h-5 w-5" />}
        label={t("statistics.tasks.assignedUsers")}
        value={analytics.totalAssignedUsers || 0}
        total={data.allUsers?.length || 0}
        color="text-purple-600"
        bgColor="bg-purple-50"
      />
    </div>
  )
}
