"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Mic,
  Upload,
  Save,
  Eye,
  X,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Sparkles,
  Plus,
  List,
  UserCheck,
  Check,
  ChevronsUpDown,
  ImageIcon,
  Search,
} from "lucide-react"
import { VoiceRecorder } from "@/components/ui/voice-recorder"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"
import { useAuthUser } from "@/hooks/useAuthUser"
import { apiService } from "@/lib/api"

const CustomButton = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}: {
  children: ReactNode
  variant?: "default" | "outline" | "destructive"
  size?: "default" | "sm" | "lg"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
  onClick?: () => void
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 theme-focus"

  const variants = {
    default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
    outline:
      "border-2 border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const CustomInput = ({
  className = "",
  type = "text",
  placeholder,
  value,
  onChange,
  id,
  min,
  step,
  accept,
  ...props
}: {
  className?: string
  type?: string
  placeholder?: string
  value?: string | number
  onChange?: (e: any) => void
  id?: string
  min?: string
  step?: string
  accept?: string
}) => {
  return (
    <input
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      step={step}
      accept={accept}
      className={cn(
        "flex w-full rounded-lg border-2 border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm transition-colors",
        "placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

const CustomTextarea = ({
  className = "",
  placeholder,
  value,
  onChange,
  id,
  rows = 4,
  ...props
}: {
  className?: string
  placeholder?: string
  value?: string
  onChange?: (e: any) => void
  id?: string
  rows?: number
}) => {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={cn(
        "flex w-full rounded-lg border-2 border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm transition-colors",
        "placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className,
      )}
      {...props}
    />
  )
}

const CustomCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  )
}

const CustomLabel = ({
  children,
  htmlFor,
  className = "",
}: { children: ReactNode; htmlFor?: string; className?: string }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
    >
      {children}
    </label>
  )
}

const CustomBadge = ({
  children,
  variant = "default",
  className = "",
}: { children: ReactNode; variant?: "default" | "secondary"; className?: string }) => {
  const variants = {
    default: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}

const CustomAlert = ({
  children,
  variant = "default",
  className = "",
}: { children: ReactNode; variant?: "default" | "destructive"; className?: string }) => {
  const variants = {
    default: "border-[var(--border)] text-[var(--foreground)]",
    destructive: "border-[var(--destructive)]/50 text-[var(--destructive)] [&>svg]:text-[var(--destructive)]",
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[var(--foreground)] [&>svg~*]:pl-7",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  )
}

const CustomManagerSelector = ({
  managers,
  selectedManagerId,
  onSelect,
  loading,
  placeholder,
  searchPlaceholder,
  noResultsText,
}: {
  managers: any[]
  selectedManagerId?: string
  onSelect: (managerId: string) => void
  loading: boolean
  placeholder: string
  searchPlaceholder: string
  noResultsText: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedManager = managers.find((m) => m.id === selectedManagerId)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 border-2 border-[var(--border)] rounded-lg bg-[var(--card)]">
        <LoadingSpinner />
        <span className="text-[var(--muted-foreground)] font-medium">Loading managers...</span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <CustomButton
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {selectedManager ? (
            <>
              {selectedManager.avatarUrl ? (
                <img
                  src={selectedManager.avatarUrl || "/placeholder.svg"}
                  alt={selectedManager.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[var(--primary)]" />
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedManager.name}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{selectedManager.email}</span>
              </div>
            </>
          ) : (
            <span className="text-[var(--muted-foreground)]">{placeholder}</span>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </CustomButton>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--popover)] border-2 border-[var(--border)] rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <CustomInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredManagers.length === 0 ? (
              <div className="p-4 text-center text-[var(--muted-foreground)]">{noResultsText}</div>
            ) : (
              filteredManagers.map((manager) => (
                <div
                  key={manager.id}
                  onClick={() => {
                    onSelect(manager.id)
                    setIsOpen(false)
                    setSearchTerm("")
                  }}
                  className="flex items-center gap-3 p-4 hover:bg-[var(--accent)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {manager.avatarUrl ? (
                      <img
                        src={manager.avatarUrl || "/placeholder.svg"}
                        alt={manager.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{manager.name}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">{manager.email}</span>
                    </div>
                  </div>
                  {selectedManagerId === manager.id && <Check className="h-5 w-5 text-[var(--primary)]" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const CustomSelect = ({
  value,
  onValueChange,
  placeholder,
  children,
  className = "",
}: {
  value?: string
  onValueChange: (value: string) => void
  placeholder: string
  children: ReactNode
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <CustomButton
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("w-full h-14 justify-between text-left", className)}
      >
        <span className={value ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </CustomButton>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--popover)] border-2 border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as any, {
                onClick: () => {
                  onValueChange(child.props.value)
                  setIsOpen(false)
                },
              })
            }
            return child
          })}
        </div>
      )}
    </div>
  )
}

const CustomSelectItem = ({
  value,
  children,
  onClick,
}: {
  value: string
  children: ReactNode
  onClick?: () => void
}) => {
  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-[var(--accent)] cursor-pointer transition-colors border-b border-[var(--border)] last:border-b-0"
    >
      {children}
    </div>
  )
}

const CustomTabs = ({
  defaultValue,
  children,
  className = "",
}: {
  defaultValue: string
  children: ReactNode
  className?: string
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={cn("space-y-6", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            activeTab,
            setActiveTab,
          })
        }
        return child
      })}
    </div>
  )
}

const CustomTabsList = ({
  children,
  activeTab,
  setActiveTab,
  className = "",
}: {
  children: ReactNode
  activeTab?: string
  setActiveTab?: (value: string) => void
  className?: string
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 h-16 bg-[var(--card)] border-2 border-[var(--border)] rounded-lg p-1",
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            activeTab,
            setActiveTab,
          })
        }
        return child
      })}
    </div>
  )
}

const CustomTabsTrigger = ({
  value,
  children,
  activeTab,
  setActiveTab,
  className = "",
}: {
  value: string
  children: ReactNode
  activeTab?: string
  setActiveTab?: (value: string) => void
  className?: string
}) => {
  const isActive = activeTab === value

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={cn(
        "flex items-center justify-center h-14 rounded-md font-medium transition-all duration-200",
        isActive
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
        className,
      )}
    >
      {children}
    </button>
  )
}

const CustomTabsContent = ({
  value,
  children,
  activeTab,
  className = "",
}: {
  value: string
  children: ReactNode
  activeTab?: string
  className?: string
}) => {
  if (activeTab !== value) return null

  return <div className={cn("mt-6", className)}>{children}</div>
}

interface EventForm {
  title: string
  description: string
  date: string
  time: string
  location: string
  maxParticipants: number
  tags: string
  budget: number
  seriesId?: string
  newSeriesName?: string
  managerId?: string
}

interface EventSeries {
  id: string
  name: string
  description?: string
}

interface Manager {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export default function CreateEventPage() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [transcription, setTranscription] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [managersLoading, setManagersLoading] = useState(false)
  const [seriesOption, setSeriesOption] = useState<"existing" | "new" | "none">("none")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventForm>({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      maxParticipants: 1,
      tags: "",
      budget: 0,
      seriesId: "",
      newSeriesName: "",
      managerId: "",
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    const fetchEventSeries = async () => {
      setSeriesLoading(true)
      try {
        const response = await apiService.getEventSeries()
        setEventSeries(response || [])
      } catch (error) {
        console.error("Failed to fetch event series:", error)
      } finally {
        setSeriesLoading(false)
      }
    }

    const fetchManagers = async () => {
      setManagersLoading(true)
      try {
        const response = await apiService.managersList()
        setManagers(response || [])
      } catch (error) {
        console.error("Failed to fetch managers:", error)
      } finally {
        setManagersLoading(false)
      }
    }

    fetchEventSeries()
    fetchManagers()
  }, [])

  const handleVoiceTranscription = async (voiceData: any) => {
    setTranscription(voiceData)

    if (voiceData.text && voiceData.confidence > 0.7) {
      try {
        setValue("description", voiceData.text)
      } catch (error) {
        setError(t("createEventPage.transcriptionError"))
      }
    }
  }

  const handleImageUpload = (event: any) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t("createEventPage.imageTooLarge"))
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const onSubmit = async (data: EventForm, isDraft = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()

      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("date", data.date)
      formData.append("time", data.time)
      formData.append("location", data.location)
      formData.append("maxParticipants", String(data.maxParticipants))
      formData.append(
        "tags",
        JSON.stringify(
          data.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean),
        ),
      )
      formData.append("status", isDraft ? "draft" : "published")
      formData.append("budget", String(data.budget))

      if (data.managerId) {
        formData.append("managerId", data.managerId)
      }

      if (seriesOption === "existing" && data.seriesId) {
        formData.append("seriesId", data.seriesId)
      } else if (seriesOption === "new" && data.newSeriesName) {
        formData.append("newSeriesName", data.newSeriesName)
      }

      if (selectedImage) {
        formData.append("file", selectedImage)
      }

      await apiService.createEvent(formData)
      router.push("/manager/events")
    } catch (error: any) {
      setError(error.message || t("createEventPage.createError"))
    } finally {
      setIsLoading(false)
    }
  }

  const getSelectedSeriesName = () => {
    if (seriesOption === "existing" && watchedValues.seriesId) {
      const selectedSeries = eventSeries.find((series) => series.id === watchedValues.seriesId)
      return selectedSeries?.name
    } else if (seriesOption === "new" && watchedValues.newSeriesName) {
      return watchedValues.newSeriesName
    }
    return null
  }

  const getSelectedManagerName = () => {
    if (watchedValues.managerId) {
      const selectedManager = managers.find((manager) => manager.id === watchedValues.managerId)
      return selectedManager?.name
    }
    return null
  }

  const user = useAuthUser()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container max-w-7xl mx-auto py-12 px-4 space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full text-sm font-medium border border-[var(--border)]">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
            <Sparkles className="h-4 w-4" />
            {t("createEventPage.subtitle")}
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-[var(--foreground)]">{t("createEventPage.title")}</h1>
            <div className="w-20 h-1 bg-[var(--primary)] mx-auto rounded-full"></div>
          </div>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {t("createEventPage.pageDescription")}
          </p>
        </div>

        {error && (
          <CustomAlert variant="destructive" className="max-w-2xl mx-auto">
            <X className="h-4 w-4" />
            <div className="font-medium">{error}</div>
          </CustomAlert>
        )}

        <div className="max-w-5xl mx-auto">
          <CustomTabs defaultValue="manual" className="space-y-8">
            <CustomTabsList className="h-16">
              <CustomTabsTrigger value="voice" className="gap-3">
                <Mic className="h-5 w-5" />
                <span>{t("createEventPage.tabs.voice")}</span>
              </CustomTabsTrigger>
              <CustomTabsTrigger value="manual" className="gap-3">
                <FileText className="h-5 w-5" />
                <span>{t("createEventPage.tabs.manual")}</span>
              </CustomTabsTrigger>
            </CustomTabsList>

            <CustomTabsContent value="voice">
              <CustomCard className="p-8 bg-[var(--primary)]/5 border-[var(--primary)]/20">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-6 bg-[var(--primary)]/10 rounded-full border border-[var(--primary)]/20">
                      <Mic className="h-10 w-10 text-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{t("createEventPage.voiceRecording")}</h2>
                    <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
                      {t("createEventPage.voiceDescription")}
                    </p>
                  </div>
                  <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
                    <VoiceRecorder onTranscription={handleVoiceTranscription} disabled={isLoading} />
                  </div>
                </div>
              </CustomCard>

              {transcription && (
                <CustomCard className="p-6 border-[var(--primary)]/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                        <Eye className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <h3 className="text-xl font-bold">{t("createEventPage.transcription")}</h3>
                    </div>
                    <div className="p-4 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                      <p className="text-[var(--foreground)]">{transcription.text}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <CustomBadge variant={transcription.confidence > 0.7 ? "default" : "secondary"}>
                        {t("createEventPage.confidence")} {Math.round(transcription.confidence * 100)}%
                      </CustomBadge>
                      {transcription.confidence > 0.7 && (
                        <div className="flex items-center gap-2 text-[var(--primary)] font-medium">
                          <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                          <span>{t("createEventPage.highConfidence")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CustomCard>
              )}
            </CustomTabsContent>

            <CustomTabsContent value="manual">
              <CustomCard className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 bg-[var(--primary)]/10 rounded-lg">
                      <FileText className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{t("createEventPage.manualCreation")}</h2>
                    <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
                      {t("createEventPage.manualSubtitle")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center space-y-3 p-6 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                      <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                        <Sparkles className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <h4 className="font-semibold">{t("createEventPage.detailedForms")}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">{t("createEventPage.detailedFormsDesc")}</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3 p-6 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                      <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                        <Eye className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <h4 className="font-semibold">{t("createEventPage.livePreview")}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">{t("createEventPage.livePreviewDesc")}</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-3 p-6 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                      <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                        <Upload className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <h4 className="font-semibold">{t("createEventPage.mediaUpload")}</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">{t("createEventPage.mediaUploadDesc")}</p>
                    </div>
                  </div>
                </div>
              </CustomCard>
            </CustomTabsContent>
          </CustomTabs>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="xl:col-span-2">
            <CustomCard className="p-8">
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-2xl font-bold">{t("createEventPage.eventDetails")}</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
                <div className="space-y-4 p-6 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                      <UserCheck className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold">{t("createEventPage.eventManager")}</h3>
                  </div>

                  <div className="space-y-3">
                    <CustomLabel htmlFor="managerId" className="text-base font-medium">
                      {t("createEventPage.assignManager")}
                    </CustomLabel>
                    <CustomManagerSelector
                      managers={managers}
                      selectedManagerId={watchedValues.managerId}
                      onSelect={(managerId) => setValue("managerId", managerId)}
                      loading={managersLoading}
                      placeholder={t("createEventPage.selectManagerPlaceholder")}
                      searchPlaceholder={t("createEventPage.searchManager")}
                      noResultsText={t("createEventPage.noManagerFound")}
                    />
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {t("createEventPage.managerResponsibility")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-6 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                      <List className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold">{t("createEventPage.eventSeries")}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <CustomButton
                        type="button"
                        variant={seriesOption === "none" ? "default" : "outline"}
                        onClick={() => setSeriesOption("none")}
                      >
                        {t("createEventPage.noSeries")}
                      </CustomButton>
                      <CustomButton
                        type="button"
                        variant={seriesOption === "existing" ? "default" : "outline"}
                        onClick={() => setSeriesOption("existing")}
                        disabled={seriesLoading}
                      >
                        <List className="h-4 w-4 mr-2" />
                        {t("createEventPage.selectExisting")}
                      </CustomButton>
                      <CustomButton
                        type="button"
                        variant={seriesOption === "new" ? "default" : "outline"}
                        onClick={() => setSeriesOption("new")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("createEventPage.createNew")}
                      </CustomButton>
                    </div>

                    {seriesOption === "existing" && (
                      <div className="space-y-3">
                        <CustomLabel htmlFor="seriesId" className="text-base font-medium">
                          {t("createEventPage.selectEventSeries")}
                        </CustomLabel>
                        {seriesLoading ? (
                          <div className="flex items-center gap-3 p-4 border-2 border-[var(--border)] rounded-lg bg-[var(--card)]">
                            <LoadingSpinner />
                            <span className="text-[var(--muted-foreground)] font-medium">
                              {t("createEventPage.loadingSeries")}
                            </span>
                          </div>
                        ) : (
                          <CustomSelect
                            value={watchedValues.seriesId}
                            onValueChange={(value) => setValue("seriesId", value)}
                            placeholder={t("createEventPage.chooseSeriesPlaceholder")}
                          >
                            {eventSeries.map((series) => (
                              <CustomSelectItem key={series.id} value={series.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{series.name}</span>
                                  {series.description && (
                                    <span className="text-sm text-[var(--muted-foreground)]">{series.description}</span>
                                  )}
                                </div>
                              </CustomSelectItem>
                            ))}
                          </CustomSelect>
                        )}
                      </div>
                    )}

                    {seriesOption === "new" && (
                      <div className="space-y-3">
                        <CustomLabel htmlFor="newSeriesName" className="text-base font-medium">
                          {t("createEventPage.newSeriesName")}
                        </CustomLabel>
                        <CustomInput
                          id="newSeriesName"
                          type="text"
                          placeholder={t("createEventPage.newSeriesPlaceholder")}
                          className="h-12"
                          {...register("newSeriesName")}
                        />
                        <p className="text-sm text-[var(--muted-foreground)]">{t("createEventPage.newSeriesHelp")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <CustomLabel htmlFor="title">{t("createEventPage.title")}</CustomLabel>
                  <CustomInput
                    id="title"
                    placeholder={t("createEventPage.titlePlaceholder")}
                    type="text"
                    className="h-12"
                    {...register("title", { required: t("createEventPage.titleRequired") })}
                  />
                  {errors.title && <p className="text-sm text-[var(--destructive)]">{errors.title.message}</p>}
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="description">{t("createEventPage.description")}</CustomLabel>
                  <CustomTextarea
                    id="description"
                    placeholder={t("createEventPage.descriptionPlaceholder")}
                    rows={4}
                    {...register("description", { required: t("createEventPage.descriptionRequired") })}
                  />
                  {errors.description && (
                    <p className="text-sm text-[var(--destructive)]">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <CustomLabel htmlFor="date">{t("createEventPage.date")}</CustomLabel>
                    <CustomInput
                      id="date"
                      type="date"
                      className="h-12"
                      {...register("date", { required: t("createEventPage.dateRequired") })}
                    />
                    {errors.date && <p className="text-sm text-[var(--destructive)]">{errors.date.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <CustomLabel htmlFor="time">{t("createEventPage.time")}</CustomLabel>
                    <CustomInput
                      id="time"
                      type="time"
                      className="h-12"
                      {...register("time", { required: t("createEventPage.timeRequired") })}
                    />
                    {errors.time && <p className="text-sm text-[var(--destructive)]">{errors.time.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="location">{t("createEventPage.location")}</CustomLabel>
                  <CustomInput
                    id="location"
                    placeholder={t("createEventPage.locationPlaceholder")}
                    type="text"
                    className="h-12"
                    {...register("location", { required: t("createEventPage.locationRequired") })}
                  />
                  {errors.location && <p className="text-sm text-[var(--destructive)]">{errors.location.message}</p>}
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="maxParticipants">{t("createEventPage.maxParticipants")}</CustomLabel>
                  <CustomInput
                    id="maxParticipants"
                    type="number"
                    min="1"
                    step="1"
                    className="h-12"
                    {...register("maxParticipants", {
                      required: t("createEventPage.maxParticipantsRequired"),
                      valueAsNumber: true,
                    })}
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-[var(--destructive)]">{errors.maxParticipants.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="tags">{t("createEventPage.tags")}</CustomLabel>
                  <CustomInput
                    id="tags"
                    placeholder={t("createEventPage.tagsPlaceholder")}
                    type="text"
                    className="h-12"
                    {...register("tags")}
                  />
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="budget">{t("createEventPage.budget")}</CustomLabel>
                  <CustomInput
                    id="budget"
                    type="number"
                    min="0"
                    step="1"
                    className="h-12"
                    {...register("budget", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-4">
                  <CustomLabel htmlFor="image">{t("createEventPage.image")}</CustomLabel>
                  <div className="flex items-center gap-4">
                    <CustomInput
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <CustomButton  variant="outline">
                      <label htmlFor="image" className="flex items-center gap-2 cursor-pointer">
                        <ImageIcon className="h-4 w-4" />
                        {t("createEventPage.uploadImage")}
                      </label>
                    </CustomButton>
                    {selectedImage && (
                      <CustomButton type="button" variant="destructive" onClick={clearImage}>
                        <X className="h-4 w-4 mr-2" />
                        {t("createEventPage.removeImage")}
                      </CustomButton>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt={t("createEventPage.imagePreviewAlt")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <CustomButton type="submit" disabled={isLoading} className="flex-1 h-12">
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        {t("createEventPage.publish")}
                      </>
                    )}
                  </CustomButton>
                  <CustomButton
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    {t("createEventPage.saveAsDraft")}
                  </CustomButton>
                </div>
              </form>
            </CustomCard>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <CustomCard className="p-6 sticky top-8">
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                    <Eye className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("createEventPage.preview")}</h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Manager Preview */}
                {getSelectedManagerName() && (
                  <div className="p-4 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[var(--primary)]/10 rounded">
                        <UserCheck className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <span className="font-medium text-sm">
                        {t("createEventPage.managerLabel")}: {getSelectedManagerName()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Series Preview */}
                {getSelectedSeriesName() && (
                  <div className="p-4 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[var(--primary)]/10 rounded">
                        <List className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <span className="font-medium text-sm">
                        {t("createEventPage.seriesLabel")}: {getSelectedSeriesName()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Event Preview */}
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-[var(--border)]">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt={t("createEventPage.eventPreviewAlt")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-bold mb-2">
                      {watchedValues.title || t("createEventPage.eventTitlePlaceholder")}
                    </h4>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {watchedValues.description || t("createEventPage.descriptionPlaceholder")}
                    </p>
                  </div>
                </div>

                {/* Event Details Preview */}
                <div className="space-y-3 p-4 bg-[var(--muted)]/50 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--primary)]" />
                    <span>
                      {watchedValues.date || t("createEventPage.dateNotSet")}{" "}
                      {watchedValues.time && `${t("createEventPage.at")} ${watchedValues.time}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span className="text-[var(--muted-foreground)]">
                      {watchedValues.location || t("createEventPage.locationNotSet")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-[var(--muted-foreground)]">
                      {watchedValues.maxParticipants || 0} {t("createEventPage.maxParticipantsLabel")}
                    </span>
                  </div>
                  {watchedValues.budget > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-[var(--primary)]" />
                      <span className="text-[var(--muted-foreground)] font-medium">${watchedValues.budget}</span>
                    </div>
                  )}
                </div>

                {/* Tags Preview */}
                {watchedValues.tags && (
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-[var(--muted-foreground)]">
                      {t("createEventPage.tagsLabel")}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.tags.split(",").map((tag: string, index: number) => (
                        <CustomBadge key={index} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </CustomBadge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CustomCard>
          </div>
        </div>
      </div>
    </div>
  )
}
