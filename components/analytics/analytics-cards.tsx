"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface AnalyticsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color: "green" | "blue" | "purple" | "orange" | "red"
  trend?: {
    value: number
    isPositive: boolean
  }
}

const colorClasses = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  red: "bg-red-50 text-red-700 border-red-200",
}

const iconColorClasses = {
  green: "text-emerald-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  red: "text-red-600",
}

export function AnalyticsCard({ icon: Icon, label, value, color, trend }: AnalyticsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`${colorClasses[color]} border-2 hover:shadow-lg transition-all duration-200`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <div className={`flex items-center text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  <span>{trend.isPositive ? "↗" : "↘"}</span>
                  <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-white/50 ${iconColorClasses[color]}`}>
              <Icon size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
