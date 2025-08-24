"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Tag,
  DollarSign,
  FileText,
  Sparkles,
  Plus,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VoiceRecorder } from "@/components/ui/voice-recorder"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

import type { VoiceTranscription } from "@/lib/types"
import { useLanguage } from "@/lib/i18n"
import { useAuthUser } from "@/hooks/useAuthUser"
import { apiService } from "@/lib/api"

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
}

interface EventSeries {
  id: string
  name: string
  description?: string
}

export default function CreateEventPage() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [transcription, setTranscription] = useState<VoiceTranscription | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([])
  const [seriesLoading, setSeriesLoading] = useState(false)
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

    fetchEventSeries()
  }, [])
  console.log("Event Series:", eventSeries)
  const handleVoiceTranscription = async (voiceData: VoiceTranscription) => {
    setTranscription(voiceData)

    if (voiceData.text && voiceData.confidence > 0.7) {
      try {
        setValue("description", voiceData.text)
      } catch (error) {
        setError(t("createEventPage.transcriptionError"))
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      )
      formData.append("status", isDraft ? "draft" : "published")
      formData.append("budget", String(data.budget))

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

  const user = useAuthUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/40 rounded-full text-green-700 dark:text-green-300 text-sm font-semibold border border-green-200 dark:border-green-800">
            <Sparkles className="h-4 w-4" />
            {t("createEventPage.subtitle")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
            {t("createEventPage.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Create memorable events with our intuitive tools and AI-powered assistance
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto border-red-200 dark:border-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="manual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl">
              <TabsTrigger
                value="voice"
                className="flex items-center gap-2 h-12 rounded-lg font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Mic className="h-4 w-4" />
                {t("createEventPage.tabs.voice")}
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex items-center gap-2 h-12 rounded-lg font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                {t("createEventPage.tabs.manual")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-6">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
                    <Mic className="h-7 w-7" />
                    {t("createEventPage.voiceRecording")}
                  </CardTitle>
                  <p className="text-green-100 text-lg">Describe your event naturally and let AI help you create it</p>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <VoiceRecorder onTranscription={handleVoiceTranscription} disabled={isLoading} />
                  </div>
                </CardContent>
              </Card>

              {transcription && (
                <Card className="border-0 shadow-xl border border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Eye className="h-5 w-5 text-green-600" />
                      {t("createEventPage.transcription")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{transcription.text}</p>
                      </div>
                      <Badge
                        variant={transcription.confidence > 0.7 ? "default" : "secondary"}
                        className={
                          transcription.confidence > 0.7
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-200 text-gray-700"
                        }
                      >
                        {t("createEventPage.confidence")} {Math.round(transcription.confidence * 100)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manual">
              <Card className="border-0 shadow-xl border border-gray-200 dark:border-gray-700">
                <CardHeader className="text-center bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
                  <CardTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100">
                    <FileText className="h-5 w-5 text-green-600" />
                    {t("createEventPage.manualCreation")}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">{t("createEventPage.manualSubtitle")}</p>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-2xl border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-50 via-green-50/50 to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                  {t("createEventPage.eventDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
                  <div className="space-y-6 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-4">
                      <List className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Event Series (Optional)
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant={seriesOption === "none" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSeriesOption("none")}
                          className={
                            seriesOption === "none"
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                              : "border-gray-300 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }
                        >
                          No Series
                        </Button>
                        <Button
                          type="button"
                          variant={seriesOption === "existing" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSeriesOption("existing")}
                          className={
                            seriesOption === "existing"
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                              : "border-gray-300 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }
                          disabled={seriesLoading}
                        >
                          <List className="h-4 w-4 mr-1" />
                          Select Existing
                        </Button>
                        <Button
                          type="button"
                          variant={seriesOption === "new" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSeriesOption("new")}
                          className={
                            seriesOption === "new"
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                              : "border-gray-300 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create New
                        </Button>
                      </div>

                      {seriesOption === "existing" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="seriesId"
                            className="text-base font-semibold text-gray-900 dark:text-gray-100"
                          >
                            Select Event Series
                          </Label>
                          {seriesLoading ? (
                            <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <LoadingSpinner />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Loading series...</span>
                            </div>
                          ) : (
                            <Select
                              value={watchedValues.seriesId}
                              onValueChange={(value) => setValue("seriesId", value)}
                            >
                              <SelectTrigger className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Choose an existing event series" />
                              </SelectTrigger>
                              <SelectContent>
                                {eventSeries.map((series) => (
                                  <SelectItem key={series.id} value={series.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{series.name}</span>
                                      {series.description && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {series.description}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}

                      {seriesOption === "new" && (
                        <div className="space-y-3">
                          <Label
                            htmlFor="newSeriesName"
                            className="text-base font-semibold text-gray-900 dark:text-gray-100"
                          >
                            New Series Name
                          </Label>
                          <Input
                            id="newSeriesName"
                            type="text"
                            placeholder="Enter new event series name"
                            className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                            {...register("newSeriesName")}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This will create a new event series that you can use for future events.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="title"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <Sparkles className="h-4 w-4 text-green-500" />
                      {t("createEventPage.eventTitle")}
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder={t("createEventPage.eventTitlePlaceholder")}
                      className="h-12 text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                      {...register("title", { required: t("createEventPage.required") })}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Location Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="location"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {t("createEventPage.location")}
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder={t("createEventPage.locationPlaceholder")}
                      className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-gray-500 focus:ring-gray-500/20 bg-white dark:bg-gray-800"
                      {...register("location", { required: t("createEventPage.required") })}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Date and Time Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="date"
                        className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                      >
                        <Calendar className="h-4 w-4 text-green-500" />
                        {t("createEventPage.date")}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                        {...register("date", { required: t("createEventPage.required") })}
                      />
                      {errors.date && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="time"
                        className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                      >
                        <Calendar className="h-4 w-4 text-green-500" />
                        {t("createEventPage.time")}
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                        {...register("time", { required: t("createEventPage.required") })}
                      />
                      {errors.time && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.time.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Participants and Budget Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="maxParticipants"
                        className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                      >
                        <Users className="h-4 w-4 text-green-500" />
                        {t("createEventPage.maxParticipants")}
                      </Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        placeholder="50"
                        className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                        {...register("maxParticipants", {
                          required: t("createEventPage.required"),
                          min: { value: 1, message: t("createEventPage.minParticipants") },
                          valueAsNumber: true,
                        })}
                      />
                      {errors.maxParticipants && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.maxParticipants.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="budget"
                        className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                      >
                        <DollarSign className="h-4 w-4 text-green-500" />
                        {t("createEventPage.budget")}
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        placeholder={t("createEventPage.budgetPlaceholder")}
                        className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                        {...register("budget", { required: t("createEventPage.budgetRequired") })}
                      />
                      {errors.budget && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.budget.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="tags"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <Tag className="h-4 w-4 text-gray-500" />
                      {t("createEventPage.tags")}
                    </Label>
                    <Input
                      id="tags"
                      placeholder={t("createEventPage.tagsPlaceholder")}
                      className="h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-gray-500 focus:ring-gray-500/20 bg-white dark:bg-gray-800"
                      {...register("tags")}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t("createEventPage.tagsHelp")}</p>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <FileText className="h-4 w-4 text-green-500" />
                      {t("createEventPage.description")}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={t("createEventPage.descriptionPlaceholder")}
                      rows={6}
                      className="border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 resize-none bg-white dark:bg-gray-800"
                      {...register("description", {
                        required: t("createEventPage.required"),
                        minLength: { value: 10, message: t("createEventPage.descriptionTooShort") },
                      })}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Image Upload Field */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="image"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      <Upload className="h-4 w-4 text-green-500" />
                      {t("createEventPage.image")}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500/20 bg-white dark:bg-gray-800"
                      />
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearImage}
                          className="h-12 border-gray-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t("createEventPage.clearImage")}
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-4 relative w-full max-w-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt={t("createEventPage.preview")}
                          className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-14 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          {t("createEventPage.publish")}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                      disabled={isLoading}
                      className="flex-1 h-14 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Save as Draft
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-2xl sticky top-8 border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-green-900/30 dark:via-green-900/40 dark:to-green-900/30">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Eye className="h-5 w-5 text-green-600" />
                  {t("createEventPage.preview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {getSelectedSeriesName() && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <List className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          Part of series: {getSelectedSeriesName()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Event Header Preview */}
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="w-full h-32 rounded-xl overflow-hidden shadow-md">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Event preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {watchedValues.title || t("createEventPage.eventTitlePlaceholder")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {watchedValues.description || t("createEventPage.descriptionPlaceholder")}
                      </p>
                    </div>
                  </div>

                  {/* Event Details Preview */}
                  <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {watchedValues.date || "Date not set"} {watchedValues.time && `at ${watchedValues.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {watchedValues.location || "Location not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {watchedValues.maxParticipants || 0} max participants
                      </span>
                    </div>
                    {watchedValues.budget > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">${watchedValues.budget}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags Preview */}
                  {watchedValues.tags && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
