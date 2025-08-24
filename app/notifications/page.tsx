"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationItem } from "@/components/notifications/notification-item"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Notification, PaginatedResponse } from "@/lib/types"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const { toast } = useToast()

  // Fetch notifications and unread count
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch notifications
        const response = await apiService.getUserNotifications(pagination.limit, (pagination.page - 1) * pagination.limit)
        setNotifications(response.data)
        setFilteredNotifications(response.data)
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }))

        // Fetch unread count
        const unread = await apiService.getUnreadNotificationCount()
        setUnreadCount(unread)
      } catch (error) {
        console.error("Error fetching notifications or unread count:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast, pagination.page, pagination.limit])

  // Filter notifications
  useEffect(() => {
    let filtered = notifications

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((notif) => notif.type === typeFilter)
    }

    // Status filter
    if (statusFilter === "unread") {
      filtered = filtered.filter((notif) => !notif.read)
    } else if (statusFilter === "read") {
      filtered = filtered.filter((notif) => notif.read)
    }

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, typeFilter, statusFilter])

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id)
      setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id)
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      setFilteredNotifications((prev) => prev.filter((notif) => notif.id !== id))
      if (!notifications.find((n) => n.id === id)?.read) {
        setUnreadCount((prev) => prev - 1)
      }
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto py-12 space-y-8 max-w-4xl">
        <div className="flex items-center justify-between p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
          <div className="flex items-center gap-6">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
              <p className="text-gray-600 font-medium text-lg mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              className="gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Check className="h-5 w-5" />
              Mark all as read
            </Button>
          )}
        </div>

        <Card className="border-2 border-gray-200 shadow-lg rounded-2xl bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-green-200 font-medium"
                  />
                </div>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl border-2 border-gray-200 font-medium">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl border-2 border-gray-200 font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 shadow-lg rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <div className="h-6 w-6 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-gray-600 font-medium">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <>
                <div className="divide-y-2 divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50/50 transition-colors duration-200">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between p-4">
                  <Button
                    onClick={handlePrevPage}
                    disabled={pagination.page === 1}
                    variant="outline"
                    className="border-2 border-gray-200"
                  >
                    Previous
                  </Button>
                  <span className="self-center">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={handleNextPage}
                    disabled={pagination.page === pagination.totalPages}
                    variant="outline"
                    className="border-2 border-gray-200"
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-16 text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Bell className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No notifications found</h3>
                <p className="text-gray-600 font-medium">
                  {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "You're all caught up!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}