"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/lib/types"
import { io, type Socket } from "socket.io-client"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const [fetchedNotifications, fetchedUnreadCount] = await Promise.all([
        apiService.getUserNotifications(),
        apiService.getUnreadNotificationCount(),
      ])
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedUnreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    let socket: Socket

    try {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { auth: { token }, transports: ["websocket", "polling"] })
      socket.on("connect", () => console.log("Connected to notifications socket"))
      socket.on("notification", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        toast({ title: notification.title, description: notification.message })
      })
      socket.on("disconnect", () => console.log("Disconnected from notifications socket"))
      socket.on("connect_error", console.error)
    } catch (error) { console.error("Socket initialization error:", error) }

    return () => socket?.disconnect()
  }, [toast])

  const markAsRead = useCallback(async (id: number) => {
    try {
      await apiService.markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(prev - 1, 0))
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark notification as read", variant: "destructive" })
    }
  }, [toast])

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id)
      await apiService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (notification && !notification.isRead) setUnreadCount(prev => Math.max(prev - 1, 0))
      toast({ title: "Success", description: "Notification deleted" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" })
    }
  }, [notifications, toast])

  const markAllAsRead = useCallback(async () => {
    try {
      setIsMarkingAllRead(true)
      await apiService.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast({ title: "Success", description: "All notifications marked as read" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark all notifications as read", variant: "destructive" })
    } finally {
      setIsMarkingAllRead(false)
    }
  }, [toast])

  const LoadingSkeleton = () => (
    <div className="p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl theme-card animate-pulse">
          <div className="h-11 w-11 rounded-xl theme-bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 rounded-lg theme-bg-muted w-3/4" />
            <div className="h-3 rounded-lg theme-bg-muted w-full" />
            <div className="h-3 rounded-lg theme-bg-muted w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl theme-bg-primary flex items-center justify-center shadow-lg">
          <Bell className="h-10 w-10 theme-text-on-primary" />
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full theme-bg-secondary border-2 border-white flex items-center justify-center shadow-md">
          <div className="h-3 w-3 rounded-full theme-animate-pulse" />
        </div>
      </div>
      <h3 className="font-bold theme-text-primary text-lg mb-2">All caught up!</h3>
      <p className="text-sm theme-text-muted font-medium">No new notifications to show</p>
    </div>
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative theme-button-ghost">
          <Bell className="h-5 w-5 theme-text-primary" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full theme-badge-unread flex items-center justify-center text-xs font-bold theme-text-on-primary shadow-lg animate-pulse border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[420px] max-h-[650px] p-0 shadow-2xl theme-card rounded-2xl" align="end" forceMount>
        <div className="flex items-center justify-between p-6 border-b theme-border sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl theme-bg-primary flex items-center justify-center shadow-md">
              <Bell className="h-5 w-5 theme-text-on-primary" />
            </div>
            <div>
              <h2 className="font-bold theme-text-primary text-lg">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm theme-text-muted font-medium">
                  {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={isMarkingAllRead}
                className="h-9 px-4 text-sm theme-button-ghost font-medium rounded-xl"
              >
                {isMarkingAllRead ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 theme-button-ghost">
              <Link href="/notifications">
                <ExternalLink className="h-4 w-4 theme-text-muted" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <LoadingSkeleton />
          ) : notifications.length > 0 ? (
            <ScrollArea className="h-[450px]">
              <div className="p-3 space-y-2">
                {notifications.slice(0, 10).map((notif, idx) => (
                  <div key={notif.id} className="animate-in fade-in-0 slide-in-from-top-2 duration-300" style={{ animationDelay: `${idx * 75}ms` }}>
                    <NotificationItem notification={notif} onMarkAsRead={markAsRead} onDelete={deleteNotification} onClose={() => setIsOpen(false)} />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : <EmptyState />}
        </div>

        {notifications.length > 10 && (
          <>
            <div className="h-px theme-border-gradient" />
            <div className="p-4 theme-card rounded-b-2xl">
              <Button variant="ghost" size="sm" asChild className="w-full justify-center theme-button-ghost font-semibold rounded-xl">
                <Link href="/notifications">View all {notifications.length} notifications</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
