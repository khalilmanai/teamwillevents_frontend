"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, UserIcon, Calendar } from "lucide-react"
import type { Task } from "@/lib/types"
import React from "react"

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void
  t: (key: string) => string
  statusConfig: Record<
    Task["status"],
    { label: string; icon: React.ElementType; dotColor: string; badgeColor: string; progressColor: string }
  >
}

export function TaskCard({ task, onStatusChange, t, statusConfig }: TaskCardProps) {
  const currentStatusConfig = statusConfig[task.status]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing border bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-50">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t("Change status")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800">
                {Object.entries(statusConfig).map(([statusKey, config]) => (
                  <DropdownMenuItem
                    key={statusKey}
                    onClick={() => onStatusChange(task.id, statusKey as Task["status"])}
                    disabled={task.status === statusKey}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge className={cn(currentStatusConfig.badgeColor, "text-xs font-medium w-fit py-1 px-2")}>
            {React.createElement(currentStatusConfig.icon, { className: "h-3 w-3 mr-1" })}
            {currentStatusConfig.label}
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pb-4 px-6">
          {task.description && <p className="mb-2 line-clamp-2 text-gray-700 dark:text-gray-300">{task.description}</p>}
          {task.assignedTo ? (
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-7 w-7 border shadow-sm">
                <AvatarImage
                  src={task.assignedTo.avatarUrl || "/placeholder.svg?height=28&width=28&query=user avatar"}
                  alt={task.assignedTo.name}
                />
                <AvatarFallback className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {task.assignedTo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.assignedTo.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-3 text-muted-foreground">
              <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              <span className="text-xs italic text-gray-500 dark:text-gray-400">{t("Unassigned")}</span>
            </div>
          )}
          {task.assignedBy && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t("Assigned by")}:</span>
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={task.assignedBy.avatarUrl || "/placeholder.svg?height=20&width=20&query=assigner avatar"}
                  alt={task.assignedBy.name}
                />
                <AvatarFallback className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {task.assignedBy.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{task.assignedBy.name}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-600" />
              <span className="text-gray-500 dark:text-gray-400">
                {t("Due")}: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.createdAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-600" />
              <span className="text-gray-500 dark:text-gray-400">
                {t("Created")}: {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
