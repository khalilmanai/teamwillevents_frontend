"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "lucide-react"
import type { Task } from "@/lib/types"

interface EmployeeTaskCardProps {
  task: Task
  onInvitationResponse: (taskId: string, response: "ACCEPTED" | "REJECTED") => void
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void
  t: (key: string) => string
  statusConfig: Record<
    Task["status"],
    {
      label: string
      icon: any
      dotColor: string
      badgeColor: string
      progressColor?: string
      badgeVariant?: "default" | "secondary" | "destructive" | "outline"
      bgColor?: string
    }
  >
  isUpdating: boolean
}

export function EmployeeTaskCard({
  task,
  onInvitationResponse,
  onStatusChange,
  t,
  statusConfig,
  isUpdating,
}: EmployeeTaskCardProps) {
  const currentStatusConfig = statusConfig[task.status]
  const formatDate = (date?: string) => date && new Date(date).toLocaleDateString()

  const cardBaseClasses = "shadow-sm hover:shadow-md transition-all duration-200 border theme-card-filled"
  const cardBgClass = currentStatusConfig.bgColor ? currentStatusConfig.bgColor : ""

  const badgeBaseClasses = "text-xs font-medium w-fit py-1 px-2 theme-bg-card theme-text-primary"
  const badgeColorClass = currentStatusConfig.badgeColor || "bg-muted text-muted-foreground"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <Card
        className={cn(
          cardBaseClasses,
          cardBgClass,
          isUpdating && "opacity-60 pointer-events-none"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold theme-text-primary">{task.title}</CardTitle>
            <Badge
              className={cn(badgeBaseClasses, badgeColorClass)}
              variant={currentStatusConfig.badgeVariant}
            >
              {currentStatusConfig.icon && React.createElement(currentStatusConfig.icon, { className: "h-3 w-3 mr-1" })}
              {currentStatusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm theme-text-muted pb-4 px-6">
          {task.description && <p className="mb-2 line-clamp-2 theme-text-primary">{task.description}</p>}

          {task.assignedBy && (
            <div className="flex items-center gap-2 mt-3 theme-text-muted">
              <span className="text-xs theme-text-muted">{t("Assigned by")}:</span>
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={task.assignedBy.avatarUrl || "/placeholder.svg?height=20&width=20&query=assigner avatar"}
                  alt={task.assignedBy.name}
                />
                <AvatarFallback className="text-xs font-medium theme-bg-muted theme-text-primary">
                  {task.assignedBy.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium theme-text-primary">{task.assignedBy.name}</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs theme-text-muted mt-2">
              <Calendar className="h-3 w-3 theme-text-muted" />
              <span className="theme-text-muted">{t("Due")}: {formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.createdAt && (
            <div className="flex items-center gap-1 text-xs theme-text-muted mt-1">
              <Calendar className="h-3 w-3 theme-text-muted" />
              <span className="theme-text-muted">{t("Created")}: {formatDate(task.createdAt)}</span>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            {task.status === "PENDING" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onInvitationResponse(task.id, "ACCEPTED")}
                  disabled={isUpdating}
                  className="flex-1 theme-adaptive-button"
                >
                  {t("Accept")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onInvitationResponse(task.id, "REJECTED")}
                  disabled={isUpdating}
                  className="flex-1 theme-adaptive-button"
                >
                  {t("Reject")}
                </Button>
              </>
            ) : ["ACCEPTED", "TODO", "IN_PROGRESS"].includes(task.status) ? (
              <Select
                value={task.status}
                onValueChange={(value) => onStatusChange(task.id, value as Task["status"])}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full theme-adaptive-button">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["TODO", "IN_PROGRESS", "DONE"].map((st) => (
                    <SelectItem key={st} value={st}>
                      {statusConfig[st as "TODO" | "IN_PROGRESS" | "DONE"].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
