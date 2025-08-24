"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Save,
  X,
  ImageIcon,
  Users,
  Tag,
  Info,
  MoreVertical,
  Trash2,
  CalendarX,
  AlertTriangle,
  CheckCircle,
  User2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import { useRouter } from "next/navigation"
import type { Event } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion" // Added for animations
import type { JSX } from "react" // Added for JSX type

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

// Enhanced EventMetaCard component
function EventMetaCard({
  icon: Icon,
  label,
  value,
  color = "blue",
  className = "",
}: {
  icon: any
  label: string
  value: React.ReactNode
  color?: "green" | "blue" | "purple" | "orange" | "gray" | "red"
  className?: string
}) {
  const colorClasses = {
    green: "from-emerald-500/20 to-emerald-600/10 border-emerald-200/50 text-emerald-700",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-200/50 text-blue-700",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-200/50 text-purple-700",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-200/50 text-orange-700",
    gray: "from-gray-500/20 to-gray-600/10 border-gray-200/50 text-gray-700",
    red: "from-red-500/20 to-red-600/10 border-red-200/50 text-red-700",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-xl p-4 border shadow-sm transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-white/70 shadow-sm">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{label}</p>
          <div className="text-sm font-semibold">
            {typeof value === "string" ? <p className="truncate">{value}</p> : value}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced ManagerCard component
function ManagerCard({ manager }: { manager: Manager }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/90"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 shadow-sm">
        {manager.avatarUrl ? (
          <img
            src={manager.avatarUrl || "/placeholder.svg"}
            alt={manager.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User2 className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{manager.name}</p>
        <p className="text-xs text-gray-600 truncate">{manager.email}</p>
        {manager.department && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {manager.job} • {manager.department}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          {" "}
          {/* Changed to blue */}
          {manager.role}
        </span>
      </div>
    </motion.div>
  )
}

// Actions Dropdown Component
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
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
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
              className="absolute right-0 top-12 z-20 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-white/40 shadow-xl overflow-hidden"
            >
              <div className="py-2">
                <button
                  onClick={() => {
                    onEdit()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50/80 transition-colors duration-150"
                >
                  <Edit3 className="w-4 h-4 mr-3 text-blue-600" />
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    onPostpone()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50/80 transition-colors duration-150"
                >
                  <CalendarX className="w-4 h-4 mr-3 text-orange-600" />
                  Postpone Event
                </button>
                <div className="border-t border-gray-200/50 my-1" />
                <button
                  onClick={() => {
                    onDelete()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-150"
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

// Confirmation Modal Component
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
  const iconColor = type === "danger" ? "text-red-600" : "text-blue-600"
  const buttonColor = type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
        className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-white/40 shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full ${type === "danger" ? "bg-red-100" : "bg-blue-100"}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-gray-600 mb-6 leading-relaxed">{message}</div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${buttonColor} rounded-lg transition-colors duration-150 disabled:opacity-50 flex items-center justify-center`}
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

// Main Component
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
  })

  const handleFormChange = useCallback((field: keyof typeof editForm, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handlePostponeFormChange = useCallback((field: "date" | "time", value: string) => {
    setPostponeForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsUploading(true)
      const updatedEvent = await apiService.updateEvent(event.id, {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        category: editForm.category,
        status: editForm.status,
        imageUrl: editForm.imageUrl,
      })
      setEvent({ ...event, ...updatedEvent, updatedAt: new Date().toISOString() })
      setIsEditing(false)
      toast({ title: "Success", description: "Event updated successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update event", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }, [editForm, event, setEvent, toast])

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
    })
    setIsEditing(false)
  }, [event])

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const response = await apiService.uploadMedia(formData)
        setEditForm((prev) => ({ ...prev, imageUrl: response.mediaUrl }))
        toast({ title: "Success", description: "Image uploaded successfully" })
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" })
      } finally {
        setIsUploading(false)
      }
    },
    [toast],
  )

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handlePostpone = useCallback(() => {
    setConfirmModal({ isOpen: true, type: "postpone", isLoading: false })
    setPostponeForm({ date: event.date, time: event.time })
  }, [event])

  const handleDelete = useCallback(() => {
    setConfirmModal({ isOpen: true, type: "delete", isLoading: false })
  }, [])

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

  const normalizedStatus = (isEditing ? editForm.status : event.status).toUpperCase() as
    | "PUBLISHED"
    | "PENDING"
    | "CANCELLED"

  const statusConfig = {
    PUBLISHED: {
      variant: "default" as const,
      bgColor: "from-emerald-500/15 to-emerald-600/5 border-emerald-200/60",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    PENDING: {
      variant: "secondary" as const,
      bgColor: "from-amber-500/15 to-amber-600/5 border-amber-200/60",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
    },
    CANCELLED: {
      variant: "destructive" as const,
      bgColor: "from-red-500/15 to-red-600/5 border-red-200/60",
      badge: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const currentStatusConfig = statusConfig[normalizedStatus] || statusConfig.PUBLISHED

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Main Event Card */}
      <div
        className={`relative overflow-hidden border-2 bg-gradient-to-br ${currentStatusConfig.bgColor} shadow-2xl rounded-3xl`}
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative p-8 lg:p-12">
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row gap-8 mb-10">
            {/* Image Section */}
            <div className="w-full xl:w-2/5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/40 bg-white/20 aspect-video shadow-xl group">
                {editForm.imageUrl ? (
                  <img
                    src={editForm.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                    <ImageIcon className="w-20 h-20 text-gray-400" />
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
                    <button
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                    >
                      {isUploading ? (
                        <div className="text-white flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </div>
                      ) : (
                        <div className="text-white flex items-center text-lg font-medium">
                          <Edit3 className="w-5 h-5 mr-3" />
                          {editForm.imageUrl ? "Change Image" : "Add Image"}
                        </div>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Content Section */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    {isEditing ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => handleFormChange("status", e.target.value)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm border shadow-sm bg-white/90 backdrop-blur-sm transition-all duration-200 ${currentStatusConfig.badge} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="published">✅ Published</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${currentStatusConfig.badge}`}
                      >
                        {normalizedStatus === "PUBLISHED" && "✅"}
                        {normalizedStatus === "PENDING" && "⏳"}
                        {normalizedStatus === "CANCELLED" && "❌"}
                        <span className="ml-2">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span>
                      </span>
                    )}
                    {!isEditing && (
                      <ActionsDropdown
                        onEdit={handleEdit}
                        onPostpone={handlePostpone}
                        onDelete={handleDelete}
                        disabled={isUploading}
                      />
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        value={editForm.title}
                        onChange={(e) => handleFormChange("title", e.target.value)}
                        className="w-full text-3xl lg:text-4xl font-bold bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Event Title"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isUploading}
                          className="flex items-center px-6 py-3 bg-white/80 hover:bg-white/90 text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl border border-white/50 backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 drop-shadow-sm leading-tight">
                      {event.title}
                    </h1>
                  )}
                </div>
              </div>
              {/* Event Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                <EventMetaCard
                  icon={Calendar}
                  label="Date"
                  value={
                    isEditing ? (
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => handleFormChange("date", e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    )
                  }
                  color="green"
                />
                <EventMetaCard
                  icon={Clock}
                  label="Time"
                  value={
                    isEditing ? (
                      <input
                        type="time"
                        value={editForm.time}
                        onChange={(e) => handleFormChange("time", e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      new Date(`2000-01-01T${event.time}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    )
                  }
                  color="blue"
                />
                <EventMetaCard
                  icon={MapPin}
                  label="Location"
                  value={
                    isEditing ? (
                      <input
                        value={editForm.location}
                        onChange={(e) => handleFormChange("location", e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Event Location"
                      />
                    ) : (
                      event.location
                    )
                  }
                  color="purple"
                />
                <EventMetaCard
                  icon={Tag}
                  label="Category"
                  value={
                    isEditing ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => handleFormChange("category", e.target.value as EventCategory)}
                        className="w-full mt-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {t(`events.categories.${category.toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{t(`events.categories.${event.category.toLowerCase()}`)}</span>
                    )
                  }
                  color="orange"
                />
                <EventMetaCard icon={Info} label="Created" value={formatDateTime(event.createdAt)} color="gray" />
                {event.updatedAt && (
                  <EventMetaCard
                    icon={Info}
                    label="Last Updated"
                    value={formatDateTime(event.updatedAt)}
                    color="gray"
                  />
                )}
              </div>
            </div>
          </div>
          {/* Description Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-white/40">
            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
              {" "}
              {/* Stronger text color */}
              <Edit3 className="w-6 h-6 mr-3 text-blue-600" />
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                className="w-full min-h-[200px] bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 leading-relaxed"
                placeholder="Provide a detailed description of your event..."
              />
            ) : (
              <div className="text-gray-700 leading-relaxed">
                {" "}
                {/* Stronger text color */}
                {event.description ? (
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">{event.description}</p>
                ) : (
                  <p className="italic text-gray-400">No description provided</p>
                )}
              </div>
            )}
          </div>
          {/* Organizers Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                {" "}
                {/* Stronger text color */}
                <Users className="w-6 h-6 mr-3 text-purple-600" />
                Event Organizers
              </h3>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                {event.managers.length} {event.managers.length === 1 ? "Manager" : "Managers"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {event.managers.map((manager: Manager) => (
                <ManagerCard key={manager.id} manager={manager} />
              ))}
            </div>
            {event.managers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 italic text-lg">No organizers assigned</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, type: null, isLoading: false })}
            onConfirm={confirmAction}
            title={confirmModal.type === "delete" ? "Delete Event" : "Postpone Event"}
            message={
              confirmModal.type === "delete" ? (
                "Are you sure you want to delete this event? This action cannot be undone and all related data will be permanently removed."
              ) : (
                <>
                  <p className="mb-4">Please provide a new date and time to postpone the event:</p>
                  <div className="space-y-4">
                    <input
                      type="date"
                      value={postponeForm.date}
                      onChange={(e) => handlePostponeFormChange("date", e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="time"
                      value={postponeForm.time}
                      onChange={(e) => handlePostponeFormChange("time", e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )
            }
            type={confirmModal.type === "delete" ? "danger" : "default"}
            isLoading={confirmModal.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
