"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface BudgetOverviewProps {
  analytics: any
  data: any
}

export function BudgetOverview({ analytics, data }: BudgetOverviewProps) {
  const { t } = useTranslation()

  return (
    <Card className="border-2 shadow-sm w-full bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          {t("statistics.budget.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BudgetMetric
            label={t("statistics.budget.planned")}
            value={analytics.plannedBudget || 0}
            color="text-blue-600"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <BudgetMetric
            label={t("statistics.budget.actual")}
            value={analytics.actualBudget || 0}
            color="text-green-600"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <BudgetMetric
            label={t("statistics.budget.variance")}
            value={Math.abs(analytics.budgetVariance || 0)}
            color={analytics.budgetVariance >= 0 ? "text-green-600" : "text-red-600"}
            icon={analytics.budgetVariance >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          />
        </div>

        {data.costItems && data.costItems.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-base text-gray-900">{t("statistics.budget.breakdown")}</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {analytics.costBreakdown?.map((item: any, index: number) => (
                <CostBreakdownItem
                  key={item.id || `${item.category}-${index}`}
                  category={item.category}
                  amount={item.amount}
                  percentage={item.percentage || (analytics.plannedBudget ? (item.amount / analytics.plannedBudget) * 100 : 0)}
                  colorIndex={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            {t("statistics.budget.noData")}
          </div>
        )}
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
    <div className="text-center space-y-2 p-4 bg-gray-50 rounded-lg transition-shadow hover:shadow-sm">
      <div className={`${color} flex items-center justify-center gap-1`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">${value.toLocaleString()}</div>
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
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm font-medium text-gray-700">{category}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900">${amount.toLocaleString()}</div>
        <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
      </div>
    </div>
  )
}