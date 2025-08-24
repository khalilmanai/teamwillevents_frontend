"use client"

import { Calendar, Clock, MapPin, Users, CheckCircle, Ticket, Share2, Bookmark, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, formatTime, getEventStatus } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EventDetails } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/lib/i18n"
import ChatWindow from "@/app/chat/chat-window"

export default function EmployeeEventDetails() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const userId = searchParams.get("userId") 
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const fetchEventAndParticipation = async () => {
      try {
        if (!eventId || !userId) return
        const data = await apiService.getEvent(eventId)
        setEvent(data)
        const participation = await apiService.verifyParticipation(eventId, userId)
        setIsRegistered(participation.registered)
      } catch (error) {
        console.error("Failed to fetch event or participation:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEventAndParticipation()
  }, [eventId, userId])

  const handleRegister = async () => {
    if (!eventId || isRegistered) return
    setIsRegistering(true)
    try {
      await apiService.participate(eventId)
      const updatedEvent = await apiService.getEvent(eventId)
      setIsRegistered(true)
      setEvent(updatedEvent)
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancel = async () => {
    if (!eventId || !isRegistered) return
    setIsCancelling(true)
    try {
      await apiService.cancelParticipation(eventId)
      const updatedEvent = await apiService.getEvent(eventId)
      setIsRegistered(false)
      setEvent(updatedEvent)
    } catch (error) {
      console.error("Cancellation failed:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  const eventStatus = event ? getEventStatus(event) : null
  const isUpcoming = eventStatus === "upcoming"
  const isOngoing = eventStatus === "ongoing"

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {t("eventDetails.eventNotFound")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          {t("eventDetails.eventNotFoundMessage")}
        </p>
        <Button variant="outline" className="px-6">
          {t("eventDetails.backToEvents")}
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Event Content */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden">
              {/* Event Image */}
              <div className="relative h-64 sm:h-80 lg:h-96">
                <img
                  src={event.imageUrl || "/placeholder-event.jpg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge
                    variant={isOngoing ? "destructive" : isUpcoming ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {t(`eventDetails.status.${eventStatus}`)}
                  </Badge>
                  <h1 className="text-3xl font-bold text-white mt-2">
                    {event.title}
                  </h1>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Separator />

                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t("eventDetails.description")}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {event.category && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t("eventDetails.category")}
                    </h3>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {event.category === "OTHER" ? t("eventDetails.otherCategory") : event.category}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleRegister}
                    disabled={!isUpcoming || isRegistering || isRegistered}
                    className="flex-1 py-6 text-base font-medium"
                  >
                    {isRegistering ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {t("eventDetails.registeringButton")}
                      </>
                    ) : isRegistered ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {t("eventDetails.registeredButton")}
                      </>
                    ) : (
                      <>
                        <Ticket className="h-5 w-5 mr-2" />
                        {t("eventDetails.registerButton")}
                      </>
                    )}
                  </Button>
                  {isRegistered && (
                    <Button
                      onClick={handleCancel}
                      disabled={!isUpcoming || isCancelling}
                      variant="destructive"
                      className="flex-1 py-6 text-base font-medium"
                    >
                      {isCancelling ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {t("eventDetails.cancellingButton")}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 mr-2" />
                          {t("eventDetails.cancelButton")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Actions and Participants */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("eventDetails.actions")}
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="h-4 w-4" />
                    {t("eventDetails.share")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Bookmark className="h-4 w-4" />
                    {t("eventDetails.save")}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="sticky top-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("eventDetails.participants")} ({event.participants?.length || 0})
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button>
                        <Users className="h-5 w-5 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("eventDetails.participantsList")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {event.participants?.length ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {event.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.user?.avatarUrl} />
                          <AvatarFallback>
                            {participant.user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {participant.user?.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {participant.user?.job || t("eventDetails.participantsList")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t("eventDetails.noParticipants")}
                    </p>
                    {isUpcoming && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        {t("eventDetails.firstToRegister")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
            <ChatWindow eventId={eventId} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}