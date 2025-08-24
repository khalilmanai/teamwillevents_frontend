"use client"

import type React from "react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { CheckCircle, AlertTriangle, XCircle, Info, MoreVertical, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api"
import type { Notification } from "@/lib/types"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
  onClose?: () => void
}

const typeConfig = {
  INFO: {
    icon: Info,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    dotColor: "bg-slate-500",
  },
  SUCCESS: {
    icon: CheckCircle,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  ERROR: {
    icon: XCircle,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
  },
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClose }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const config = typeConfig[notification.type]
  const Icon = config.icon

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    onClose?.()
  }

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.isRead) return

    setIsLoading(true)
    try {
      await apiService.markNotificationAsRead(notification.id)
      onMarkAsRead(notification.id)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await apiService.deleteNotification(notification.id)
      onDelete(notification.id)
    } catch (error) {
      console.error("Failed to delete notification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <div
      className={cn(
        "relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg",
        notification.isRead
          ? "bg-gray-50/80 border-gray-200/60 opacity-70 hover:opacity-85 hover:bg-gray-50"
          : "bg-white border-green-200 shadow-md hover:shadow-xl hover:border-green-300",
        !notification.isRead && "shadow-green-100/50",
      )}
      onClick={handleClick}
    >
      {!notification.isRead && (
        <div className="absolute -left-1 top-6 h-12 w-1.5 bg-gradient-to-b from-green-500 via-green-600 to-green-700 rounded-full shadow-sm" />
      )}

      <div
        className={cn(
          "flex-shrink-0 p-3 rounded-xl transition-all duration-200 shadow-sm",
          notification.isRead
            ? "bg-gray-100 text-gray-500 shadow-gray-200/50"
            : `${config.bgColor} ${config.color} shadow-${config.color.split("-")[1]}-200/30`,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-base font-bold leading-tight tracking-tight",
                notification.isRead ? "text-gray-500" : "text-gray-900",
              )}
            >
              {notification.title}
            </h4>

            <p
              className={cn(
                "text-sm leading-relaxed mt-2 font-medium",
                notification.isRead ? "text-gray-400" : "text-gray-700",
              )}
            >
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {!notification.isRead && (
              <div className="relative">
                <div className={cn("h-3 w-3 rounded-full animate-pulse", config.dotColor)} />
                <div className={cn("absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-30", config.dotColor)} />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 transition-all duration-200 rounded-xl",
                    "opacity-0 group-hover:opacity-100",
                    "hover:bg-green-50 hover:scale-110 hover:shadow-md",
                    "border border-transparent hover:border-green-200",
                  )}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                  <span className="sr-only">Notification options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-white border-2 border-gray-200 shadow-xl rounded-xl">
                {!notification.isRead && (
                  <DropdownMenuItem
                    onClick={handleMarkAsRead}
                    disabled={isLoading}
                    className="hover:bg-green-50 hover:text-green-700 rounded-lg mx-1 my-1"
                  >
                    <Check className="mr-3 h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg mx-1 my-1"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500 font-semibold tracking-wide">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>

          {notification.isRead && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              Read
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block" target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    )
  }

  return content
}
