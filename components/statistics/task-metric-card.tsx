"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface TaskMetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  total: number
  color: string
  bgColor: string
  isPercentage?: boolean
}

export function TaskMetricCard({
  icon,
  label,
  value,
  total,
  color,
  bgColor,
  isPercentage = false,
}: TaskMetricCardProps) {
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
