import Link from "next/link"
import { Calendar, Clock, MapPin, Users, Ticket, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types"
import { formatDate, formatTime, getEventStatus } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { LoadingSpinner } from "./loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/i18n"
import { motion, AnimatePresence } from "framer-motion"

interface EventCardProps {
  event: Event
  userId: string
  onRegister?: (eventId: string) => void
  showActions?: boolean
}

export function EventCard({ event, userId, onRegister, showActions = true }: EventCardProps) {
  const { t } = useLanguage()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loadingParticipation, setLoadingParticipation] = useState(true)

  const eventStatus = getEventStatus(event)
  const isUpcoming = eventStatus === "upcoming"
  const isOngoing = eventStatus === "ongoing"
  const currentParticipants = event.participants?.length || 0
  const hasMaxCapacity = event.maxCapacity != null && event.maxCapacity > 0
  const isFull = hasMaxCapacity && currentParticipants >= event.maxCapacity

  useEffect(() => {
    async function checkParticipation() {
      if (!userId) {
        setLoadingParticipation(false)
        return
      }
      try {
        setLoadingParticipation(true)
        const result = await apiService.verifyParticipation(event.id, userId)
        setIsRegistered(result.registered)
      } finally {
        setLoadingParticipation(false)
      }
    }
    checkParticipation()
  }, [event.id, userId])

  const handleRegister = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (isRegistered || !isUpcoming || isFull) return
    setIsRegistering(true)
    try {
      await apiService.participate(event.id)
      setIsRegistered(true)
      onRegister?.(event.id)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isRegistered) return
    setIsRegistering(true)
    try {
      await apiService.cancelParticipation(event.id)
      setIsRegistered(false)
      onRegister?.(event.id)
    } finally {
      setIsRegistering(false)
    }
  }

  const getStatusBadge = () => {
    if (isOngoing) return <Badge className="animate-pulse bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">{t("eventCard.status.ongoing")}</Badge>
    if (isUpcoming) return <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">{t("eventCard.status.upcoming")}</Badge>
    return <Badge className="bg-muted text-muted-foreground border border-muted/50 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">{t("eventCard.status.ended")}</Badge>
  }

  const displayedParticipants = isRegistered
    ? [{ id: userId, user: event.participants?.find(p => p.id === userId)?.user }, ...(event.participants?.filter(p => p.id !== userId) || [])]
    : event.participants || []

  if (loadingParticipation) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card className="relative w-full h-64 md:h-48 flex justify-center items-center rounded-2xl shadow-md border border-border bg-card">
          <LoadingSpinner />
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link href={{ pathname: `/employee/events/${event.id}`, query: { eventId: event.id, userId } }} passHref>
        <Card className="group relative w-full flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-md border border-border bg-card hover:shadow-xl hover:border-primary/50 cursor-pointer">
          {/* Image */}
          <motion.div className="md:w-1/3 relative overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <div className="h-48 md:h-full w-full bg-muted flex items-center justify-center">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-l-2xl"/>
              ) : (
                <div className="text-muted-foreground text-center px-4">{t("eventCard.noImageAvailable")}</div>
              )}
            </div>
          </motion.div>

          {/* Content */}
          <div className="md:w-2/3 flex flex-col">
            <CardHeader className="p-4 pb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-border transition-all group-hover:ring-primary">
                  <AvatarImage src={event.managers?.[0]?.avatarUrl}/>
                  <AvatarFallback className="text-xs">{event.managers?.[0]?.name?.charAt(0) || "O"}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground font-medium group-hover:text-primary">{event.managers?.[0]?.name || t("eventCard.organizer")}</span>
              </div>
              {getStatusBadge()}
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary">{event.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/>{formatDate(event.date)}</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/>{formatTime(event.time)}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/>{event.location}</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary"/><span className={isFull ? "text-destructive font-medium" : ""}>{currentParticipants}{hasMaxCapacity ? `/${event.maxCapacity}` : ""}</span></div>
              </div>

              {event.category && <Badge className="mt-2 text-xs font-medium bg-primary/5 text-primary border border-primary/20 px-2.5 py-0.5 shadow-sm hover:bg-primary/10">{event.category}</Badge>}
            </CardContent>

            {/* Footer */}
            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border">
              <div className="flex -space-x-3">
                {displayedParticipants.slice(0,5).map((p,i) => (
                  <Avatar key={p.id} className={`h-7 w-7 border-2 border-background z-${5-i} transition-transform duration-300 hover:scale-110`}>
                    <AvatarImage src={p.user?.avatarUrl}/>
                    <AvatarFallback className="text-xs">{p.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                ))}
                {displayedParticipants.length>5 && <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">+{displayedParticipants.length-5}</div>}
              </div>

              {showActions && (
                isRegistered ? (
                  <Button onClick={handleCancel} disabled={isRegistering} variant="outline" className="py-1.5 px-3 text-sm font-medium text-destructive border-destructive/50 hover:bg-destructive/5 hover:shadow-md">{isRegistering ? <LoadingSpinner size="sm"/> : t("eventCard.cancelButton")}</Button>
                ) : (
                  <Button onClick={handleRegister} disabled={!isUpcoming || isRegistering || isFull} className={`py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-300 hover:shadow-md ${isFull ? "bg-destructive hover:bg-destructive/90" : ""}`}>
                    {isRegistering ? <LoadingSpinner size="sm"/> : <div className="flex items-center gap-1.5"><Ticket className="h-4 w-4"/>{isFull ? t("eventCard.fullButton") : t("eventCard.registerButton")}</div>}
                  </Button>
                )
              )}
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
