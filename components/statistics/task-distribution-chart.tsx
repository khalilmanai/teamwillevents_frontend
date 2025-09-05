"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTranslation } from "@/lib/i18n"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface TaskDistributionChartProps {
  analytics: any
}

function TaskDistributionChartCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="w-full md:w-[600px] min-h-[450px] max-h-[500px] bg-white border-2 shadow-sm rounded-lg p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="w-full h-full">{children}</div>
    </div>
  )
}

export function TaskDistributionChart({ analytics }: TaskDistributionChartProps) {
  const { t } = useTranslation()

  const data = [
    {
      name: t("statistics.tasks.completedTasks"),
      value: analytics.completedTasks || 0,
      color: "hsl(var(--chart-1))",
      icon: CheckCircle2,
    },
    {
      name: t("statistics.tasks.inProgress"),
      value: analytics.inProgressTasks || 0,
      color: "hsl(var(--chart-2))",
      icon: Clock,
    },
    {
      name: t("statistics.tasks.pendingTasks"),
      value: analytics.pendingTasks || 0,
      color: "hsl(var(--chart-3))",
      icon: AlertCircle,
    },
  ]

  const chartConfig = {
    completed: {
      label: t("statistics.tasks.completedTasks"),
      color: "hsl(var(--chart-1))",
    },
    inProgress: {
      label: t("statistics.tasks.inProgress"),
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: t("statistics.tasks.pendingTasks"),
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <TaskDistributionChartCard title={t("statistics.charts.taskDistribution")}>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 30, right: 30, bottom: 40, left: 30 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ paddingTop: "40px", fontSize: "14px" }}
              align="center"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </TaskDistributionChartCard>
  )
}