"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTranslation } from "@/lib/i18n"
import { DollarSign } from "lucide-react"

interface BudgetBreakdownChartProps {
  analytics: any
}

function BudgetChartCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="w-full md:w-[600px] min-h-[450px] max-h-[500px] bg-white border-2 shadow-sm rounded-lg p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="w-full h-full">{children}</div>
    </div>
  )
}

export function BudgetBreakdownChart({ analytics }: BudgetBreakdownChartProps) {
  const { t } = useTranslation()

  const data =
    analytics.costBreakdown?.map((item: any, index: number) => ({
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    })) || []

  const chartConfig = {
    amount: {
      label: t("statistics.budget.amount"),
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <BudgetChartCard title={t("statistics.charts.budgetBreakdown")}>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
              interval="preserveStartEnd"
              tickMargin={15}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              width={90}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value: any) => [`$${value.toLocaleString()}`, t("statistics.budget.amount")]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </BudgetChartCard>
  )
}