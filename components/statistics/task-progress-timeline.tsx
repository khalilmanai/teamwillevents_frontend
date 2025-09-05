"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTranslation } from "@/lib/i18n"
import { TrendingUp } from "lucide-react"



interface TaskProgressTimelineProps {
  analytics: any
}

function TaskProgressChartCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="w-full md:w-[600px] min-h-[450px] max-h-[500px] bg-white border-2 shadow-sm rounded-lg p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="w-full h-full">{children}</div>
    </div>
  )
}

export function TaskProgressTimeline({ analytics }: TaskProgressTimelineProps) {
  const { t } = useTranslation()

  const generateTimelineData = () => {
    const days = 7
    const data = []
    const currentCompletion = analytics.taskCompletionRate || 0

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const progress = Math.max(0, currentCompletion - i * 5 + Math.random() * 10)

      data.push({
        date: date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
        completion: Math.min(100, Math.round(progress)),
        completed: Math.round((analytics.totalTasks || 0) * (progress / 100)),
      })
    }

    return data
  }

  const data = generateTimelineData()

  const chartConfig = {
    completion: {
      label: t("statistics.tasks.completionRate"),
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <TaskProgressChartCard title={t("statistics.charts.progressTimeline")}>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              tickMargin={15}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              width={70}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: any) => [`${value}%`, t("statistics.tasks.completionRate")]}
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="var(--color-completion)"
   strokeWidth={3}
              dot={{ fill: "var(--color-completion)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </TaskProgressChartCard>
  )
}