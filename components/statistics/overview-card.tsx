"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface OverviewCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
  trend: "positive" | "negative" | "neutral"
}

export function OverviewCard({ icon, label, value, subtitle, trend }: OverviewCardProps) {
  const trendColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-amber-600",
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
