"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Save,
  X,
  ImageIcon,
  Tag,
  Info,
  MoreVertical,
  Trash2,
  CalendarX,
  AlertTriangle,
  CheckCircle,
  User2,
  Link,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import { useRouter } from "next/navigation"
import type { Event, EventSeries } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import type { JSX } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const CATEGORIES = ["WORKSHOP", "CONFERENCE", "MEETUP", "SOCIAL", "SPORTS", "OTHER"] as const

type EventCategory = (typeof CATEGORIES)[number]

interface Manager {
  id: string
  name: string
  email: string
  avatarUrl?: string
  department?: string
  job?: string
  role: string
}

function EventInfoCard({
  icon: Icon,
  label,
  value,
  isEditing = false,
  editComponent,
}: {
  icon: any
  label: string
  value: React.ReactNode
  isEditing?: boolean
  editComponent?: React.ReactNode
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            {isEditing && editComponent ? editComponent : <div className="text-sm font-medium">{value}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ManagerCard({ manager }: { manager: Manager }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={manager.avatarUrl || "/placeholder.svg"} alt={manager.name} />
            <AvatarFallback>
              <User2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{manager.name}</p>
            <p className="text-xs text-muted-foreground truncate">{manager.email}</p>
            {manager.department && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {manager.job} • {manager.department}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {manager.role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionsDropdown({
  onEdit,
  onPostpone,
  onDelete,
  disabled = false,
}: {
  onEdit: () => void
  onPostpone: () => void
  onDelete: () => void
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="theme-adaptive-button theme-transition w-10 h-10 rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed theme-focus"
      >
        <MoreVertical className="w-4 h-4 mx-auto" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-20 w-48 theme-adaptive-popover rounded-xl overflow-hidden"
            >
              <div className="py-2">
                <button
                  onClick={() => {
                    onEdit()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm hover:theme-bg-accent theme-transition"
                >
                  <Edit3 className="w-4 h-4 mr-3 text-blue-600" />
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    onPostpone()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm hover:theme-bg-accent theme-transition"
                >
                  <CalendarX className="w-4 h-4 mr-3 text-orange-600" />
                  Postpone Event
                </button>
                <div className="theme-border my-1" />
                <button
                  onClick={() => {
                    onDelete()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 theme-transition"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Event
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "default",
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string | JSX.Element
  type?: "default" | "danger"
  isLoading?: boolean
}) {
  if (!isOpen) return null

  const Icon = type === "danger" ? AlertTriangle : CheckCircle
  const iconColor = type === "danger" ? "text-red-600" : "theme-text-primary"
  const buttonColor = type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative theme-adaptive-dialog rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className={`p-3 rounded-full ${type === "danger" ? "bg-red-100" : "theme-bg-accent"}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="theme-text-muted mb-8 leading-relaxed">{message}</div>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 text-sm font-medium theme-bg-muted hover:theme-bg-accent rounded-xl theme-transition disabled:opacity-50 theme-focus"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 text-sm font-medium text-white ${buttonColor} rounded-xl theme-transition disabled:opacity-50 flex items-center justify-center theme-focus`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function OverviewTab({
  event,
  setEvent,
}: { event: Event; setEvent: React.Dispatch<React.SetStateAction<Event>> }) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([])
  const [currentEventSeries, setCurrentEventSeries] = useState<EventSeries | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [isLoadingSeries, setIsLoadingSeries] = useState(false)
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: "delete" | "postpone" | null
    isLoading: boolean
  }>({ isOpen: false, type: null, isLoading: false })
  const [postponeForm, setPostponeForm] = useState({ date: "", time: "" })

  const [editForm, setEditForm] = useState({
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    status: event.status,
    imageUrl: event.imageUrl,
    EventSeriesId: event.EventSeriesId || "",
  })

  const fetchEventStatus = useCallback(async () => {
    try {
      setIsLoadingStatus(true)
      console.log("[v0] Fetching event status for event:", event.id)

      const currentEvent = await apiService.getEvent(event.id)
      console.log("[v0] Current event status:", currentEvent.status, "Previous:", event.status)

      if (currentEvent.status !== event.status) {
        console.log("[v0] Status changed, updating state")
        setEvent((prev) => ({ ...prev, status: currentEvent.status }))
        setEditForm((prev) => ({ ...prev, status: currentEvent.status }))

        toast({
          title: "Status Updated",
          description: `Event status changed to ${currentEvent.status}`,
        })
      }

      setLastStatusCheck(new Date())
    } catch (error: any) {
      console.error("[v0] Error fetching event status:", error)
      toast({
        title: "Warning",
        description: "Could not fetch latest event status",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStatus(false)
    }
  }, [event.id, event.status, setEvent, toast])

  const fetchEventSeries = useCallback(async () => {
    try {
      setIsLoadingSeries(true)
      console.log("[v0] Fetching event series data")

      const series = await apiService.getEventSeries()
      setEventSeries(series)
      console.log("[v0] Loaded", series.length, "event series")

      if (event.EventSeriesId) {
        console.log("[v0] Fetching current event series:", event.EventSeriesId)
        const currentSeries = await apiService.getEventSeriesById(event.EventSeriesId)
        setCurrentEventSeries(currentSeries)
        console.log("[v0] Current event series:", currentSeries.name)
      } else {
        setCurrentEventSeries(null)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching event series:", error)
      toast({
        title: "Warning",
        description: "Could not load event series data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSeries(false)
    }
  }, [event.EventSeriesId, toast])

  useEffect(() => {
    console.log("[v0] Component mounted, initializing data fetch")

    // Fetch event series data
    fetchEventSeries()

    // Fetch current event status
    fetchEventStatus()

    // Set up periodic status checking for real-time updates
    const statusInterval = setInterval(() => {
      if (!isEditing && !isUploading) {
        console.log("[v0] Periodic status check")
        fetchEventStatus()
      }
    }, 30000) // Check every 30 seconds

    return () => {
      console.log("[v0] Cleaning up status interval")
      clearInterval(statusInterval)
    }
  }, []) // Removed dependencies to prevent unnecessary re-fetches

  useEffect(() => {
    if (event.EventSeriesId && event.EventSeriesId !== currentEventSeries?.id) {
      console.log("[v0] Event series changed, refetching series data")
      fetchEventSeries()
    }
  }, [event.EventSeriesId, currentEventSeries?.id, fetchEventSeries])

  const handleFormChange = useCallback((field: keyof typeof editForm, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handlePostponeFormChange = useCallback((field: "date" | "time", value: string) => {
    setPostponeForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsUploading(true)
      console.log("[v0] Saving event changes")

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        category: editForm.category,
        status: editForm.status,
        imageUrl: editForm.imageUrl,
        EventSeriesId: editForm.EventSeriesId || undefined,
      }

      const updatedEvent = await apiService.updateEvent(event.id, updateData)
      console.log("[v0] Event updated successfully")

      if (editForm.EventSeriesId !== event.EventSeriesId) {
        if (editForm.EventSeriesId) {
          console.log("[v0] Fetching new event series")
          const newSeries = await apiService.getEventSeriesById(editForm.EventSeriesId)
          setCurrentEventSeries(newSeries)
        } else {
          console.log("[v0] Clearing event series")
          setCurrentEventSeries(null)
        }
      }

      setEvent({ ...event, ...updatedEvent, updatedAt: new Date().toISOString() })
      setIsEditing(false)

      setTimeout(() => fetchEventStatus(), 1000)

      toast({ title: "Success", description: "Event updated successfully" })
    } catch (error: any) {
      console.error("[v0] Error saving event:", error)
      toast({ title: "Error", description: error.message || "Failed to update event", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }, [editForm, event, setEvent, toast, fetchEventStatus])

  const handleCancel = useCallback(() => {
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      status: event.status,
      imageUrl: event.imageUrl,
      EventSeriesId: event.EventSeriesId || "",
    })
    setIsEditing(false)
  }, [event])

  const normalizedStatus = (isEditing ? editForm.status : event.status).toUpperCase() as
    | "PUBLISHED"
    | "PENDING"
    | "CANCELLED"
    | "REJECTED"
    | "DONE"
    | "DRAFT"

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "PUBLISHED":
        return "default"
      case "PENDING":
        return "secondary"
      case "CANCELLED":
        return "destructive"
      case "REJECTED":
        return "destructive"
      case "DONE":
        return "default"
      case "DRAFT":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PUBLISHED":
        return "✅ "
      case "PENDING":
        return "⏳ "
      case "CANCELLED":
        return "❌ "
      case "REJECTED":
        return "🚫 "
      case "DONE":
        return "🎉 "
      case "DRAFT":
        return "📝 "
      default:
        return ""
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Only image files are allowed", variant: "destructive" })
        return
      }
      if (file.size > 30 * 1024 * 1024) {
        toast({ title: "Error", description: "File size exceeds 30MB limit", variant: "destructive" })
        return
      }

      setIsUploading(true)
      try {
        const response = await apiService.uploadEventImage(event.id, file)
        setEditForm((prev) => ({ ...prev, imageUrl: response.imageUrl }))
        setEvent((prev) => ({ ...prev, imageUrl: response.imageUrl }))
        toast({ title: "Success", description: "Image uploaded successfully" })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to upload image",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [event.id, toast, setEvent],
  )

  const confirmAction = useCallback(async () => {
    if (!confirmModal.type) return
    setConfirmModal((prev) => ({ ...prev, isLoading: true }))
    try {
      if (confirmModal.type === "delete") {
        await apiService.deleteEvent(event.id)
        toast({ title: "Success", description: "Event deleted successfully" })
        router.push("/events")
      } else if (confirmModal.type === "postpone") {
        if (!postponeForm.date || !postponeForm.time) {
          toast({ title: "Error", description: "Please provide a new date and time", variant: "destructive" })
          return
        }
        await apiService.updateEvent(event.id, {
          date: postponeForm.date,
          time: postponeForm.time,
          status: "pending",
        })
        setEvent((prev) => ({
          ...prev,
          date: postponeForm.date,
          time: postponeForm.time,
          status: "pending",
          updatedAt: new Date().toISOString(),
        }))
        toast({ title: "Success", description: "Event postponed successfully" })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${confirmModal.type} event`,
        variant: "destructive",
      })
    } finally {
      setConfirmModal({ isOpen: false, type: null, isLoading: false })
    }
  }, [confirmModal.type, event.id, postponeForm, router, setEvent, toast])

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                {isEditing ? (
                  <Select value={editForm.status} onValueChange={(value) => handleFormChange("status", value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">📝 Draft</SelectItem>
                      <SelectItem value="pending">⏳ Pending</SelectItem>
                      <SelectItem value="published">✅ Published</SelectItem>
                      <SelectItem value="done">🎉 Done</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      <SelectItem value="rejected">🚫 Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(event.status)} className="text-sm px-3 py-1">
                      {getStatusIcon(event.status)}
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    {isLoadingStatus && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Checking status...</span>
                      </div>
                    )}
                    {lastStatusCheck && !isLoadingStatus && (
                      <span className="text-xs text-muted-foreground">
                        Last checked: {lastStatusCheck.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
                <Badge variant="outline" className="text-sm">
                  {t(`events.categories.${event.category.toLowerCase()}`)}
                </Badge>
                {currentEventSeries && (
                  <Badge variant="secondary" className="text-sm flex items-center gap-1">
                    <Link className="w-3 h-3" />
                    {currentEventSeries.name}
                  </Badge>
                )}
                {isLoadingSeries && (
                  <Badge variant="outline" className="text-sm flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    Loading series...
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editForm.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                    placeholder="Event Title"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleSave} disabled={isUploading} className="flex items-center gap-2">
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <CardTitle className="text-3xl font-bold text-balance leading-tight">{event.title}</CardTitle>
              )}
            </div>

            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isUploading}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-3 text-blue-600" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setConfirmModal({ isOpen: true, type: "postpone", isLoading: false })}
                  >
                    <CalendarX className="w-4 h-4 mr-3 text-orange-600" />
                    Postpone Event
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setConfirmModal({ isOpen: true, type: "delete", isLoading: false })}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative rounded-lg overflow-hidden border aspect-video max-w-2xl">
            {editForm.imageUrl ? (
              <img
                src={editForm.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm"
                  variant="ghost"
                >
                  {isUploading ? (
                    <div className="text-white flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="text-white flex items-center">
                      <Edit3 className="w-5 h-5 mr-2" />
                      {editForm.imageUrl ? "Change Image" : "Add Image"}
                    </div>
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EventInfoCard
              icon={Calendar}
              label="Date"
              value={new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              isEditing={isEditing}
              editComponent={
                <Input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="mt-2"
                />
              }
            />
            <EventInfoCard
              icon={Clock}
              label="Time"
              value={new Date(`2000-01-01T${event.time}`).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
              isEditing={isEditing}
              editComponent={
                <Input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => handleFormChange("time", e.target.value)}
                  className="mt-2"
                />
              }
            />
            <EventInfoCard
              icon={MapPin}
              label="Location"
              value={event.location}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={editForm.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  placeholder="Event Location"
                  className="mt-2"
                />
              }
            />
            <EventInfoCard
              icon={Tag}
              label="Category"
              value={<span className="capitalize">{t(`events.categories.${event.category.toLowerCase()}`)}</span>}
              isEditing={isEditing}
              editComponent={
                <Select value={editForm.category} onValueChange={(value) => handleFormChange("category", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`events.categories.${category.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
            {isEditing && (
              <EventInfoCard
                icon={Link}
                label="Event Series"
                value={currentEventSeries?.name || "No series"}
                isEditing={isEditing}
                editComponent={
                  <Select
                    value={editForm.EventSeriesId || "none"}
                    onValueChange={(value) => handleFormChange("EventSeriesId", value === "none" ? "" : value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select event series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No series</SelectItem>
                      {eventSeries.map((series) => (
                        <SelectItem key={series.id} value={series.id}>
                          {series.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
            )}
            <EventInfoCard icon={Info} label="Created" value={formatDateTime(event.createdAt)} />
            {event.updatedAt && (
              <EventInfoCard icon={Info} label="Last Updated" value={formatDateTime(event.updatedAt)} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Description
            </CardTitle>
            <Badge variant="secondary">
              {event.organizers?.length || 0} {(event.organizers?.length || 0) === 1 ? "Organizer" : "Organizers"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editForm.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className="min-h-[150px] resize-none"
              placeholder="Provide a detailed description of your event..."
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              {event.description ? (
                <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User2 className="w-5 h-5" />
              Event Organizers
            </CardTitle>
            <Badge variant="secondary">
              {event.organizers?.length || 0} {(event.organizers?.length || 0) === 1 ? "Organizer" : "Organizers"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {event.organizers && event.organizers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.organizers.map((organizer) => (
                <ManagerCard
                  key={organizer.id}
                  manager={{
                    id: organizer.id,
                    name: organizer.username,
                    email: organizer.email,
                    avatarUrl: organizer.avatarUrl,
                    department: organizer.department,
                    job: organizer.job,
                    role: organizer.role,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No organizers assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentEventSeries && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Event Series Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{currentEventSeries.name}</h4>
                {currentEventSeries.description && (
                  <p className="text-muted-foreground mt-2 leading-relaxed">{currentEventSeries.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created: {formatDateTime(currentEventSeries.createdAt)}</span>
                {currentEventSeries.eventsCount && <span>• {currentEventSeries.eventsCount} events in series</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={confirmModal.isOpen}
        onOpenChange={(open) => !open && setConfirmModal({ isOpen: false, type: null, isLoading: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmModal.type === "delete" ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete Event
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Postpone Event
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {confirmModal.type === "delete"
                ? "Are you sure you want to delete this event? This action cannot be undone and all related data will be permanently removed."
                : "Please provide a new date and time to postpone the event:"}
            </DialogDescription>
          </DialogHeader>

          {confirmModal.type === "postpone" && (
            <div className="space-y-4 py-4">
              <Input
                type="date"
                value={postponeForm.date}
                onChange={(e) => handlePostponeFormChange("date", e.target.value)}
                placeholder="New date"
              />
              <Input
                type="time"
                value={postponeForm.time}
                onChange={(e) => handlePostponeFormChange("time", e.target.value)}
                placeholder="New time"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmModal({ isOpen: false, type: null, isLoading: false })}
              disabled={confirmModal.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmModal.type === "delete" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={confirmModal.isLoading}
            >
              {confirmModal.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
