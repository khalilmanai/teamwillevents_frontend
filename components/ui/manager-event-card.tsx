"use client"

import Link from "next/link"
import { Calendar, Clock, MapPin, Users, Trash2, Eye, EyeOff, Edit, Copy, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { LoadingSpinner } from "./loading-spinner"

import type { Event } from "@/lib/types"
import { formatDate, formatTime } from "@/lib/utils"
import { EventStatus } from "@/lib/event-status"
import { useLanguage } from "@/lib/i18n"

interface ManagerEventCardProps {
  event: Event
  userId: string
  onDelete: (event: Event) => void
  onDuplicate: (event: Event) => void
  onToggleStatus: (event: Event) => void
  isLoadingAction: boolean
}

export function ManagerEventCard({
  event,
  userId,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isLoadingAction,
}: ManagerEventCardProps) {
  const { t } = useLanguage()

  const now = new Date()
  const eventDateTime = new Date(`${event.date}T${event.time}`)
  const eventEndTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000)
  const isUpcoming = eventDateTime > now
  const isOngoing = eventDateTime <= now && now <= eventEndTime
  const isEnded = now > eventEndTime

  const currentParticipants = event.currentParticipants || event.participants?.length || 0
  const hasMaxCapacity = event.maxCapacity != null && event.maxCapacity > 0
  const isFull = hasMaxCapacity && currentParticipants >= event.maxCapacity

  const getStatusBadge = () => {
    switch (event.status) {
      case EventStatus.PENDING:
        return (
          <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border-yellow-300 animate-fade-in">
            {t("eventCard.status.draft") || "Brouillon"}
          </Badge>
        )
      case EventStatus.REJECTED:
        return (
          <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-destructive text-destructive-foreground border-destructive animate-fade-in">
            {t("eventCard.status.rejected") || "Rejeté"}
          </Badge>
        )
      case EventStatus.CANCELLED:
        return (
          <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground border-muted animate-fade-in">
            {t("eventCard.status.cancelled") || "Annulé"}
          </Badge>
        )
      case EventStatus.PUBLISHED:
        if (isOngoing) {
          return (
            <Badge className="text-xs font-semibold px-2 py-1 rounded-full animate-pulse bg-accent text-accent-foreground border-accent animate-fade-in">
              {t("eventCard.status.ongoing") || "En cours"}
            </Badge>
          )
        }
        if (isUpcoming) {
          return (
            <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground border-primary animate-fade-in">
              {t("eventCard.status.published") || "Publié"}
            </Badge>
          )
        }
        return (
          <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground border-muted animate-fade-in">
            {t("eventCard.status.ended") || "Terminé"}
          </Badge>
        )
      default:
        return (
          <Badge className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground border-muted animate-fade-in">
            {t("eventCard.status.unknown") || "Inconnu"}
          </Badge>
        )
    }
  }

  return (
    <Card className="relative w-full overflow-hidden theme-adaptive-card shadow-sm hover:shadow-md transition-all duration-300 ease-in-out rounded-xl group">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-1/3">
          <Link href={`/manager/events/${event.id}`} className="block">
            <div className="h-full w-full lg:h-full rounded-t-xl lg:rounded-l-xl lg:rounded-t-none theme-bg-muted flex items-center justify-center overflow-hidden">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="text-muted-foreground text-lg font-semibold text-center p-4">
                  {t("eventCard.noImageAvailable") || "Aucune image disponible"}
                </div>
              )}
            </div>
          </Link>
        </div>
        {/* Content Section */}
        <div className="lg:w-2/3 flex flex-col relative">
          <CardHeader className="p-4 pb-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={event.managers?.[0]?.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>{event.managers?.[0]?.name?.charAt(0) || "O"}</AvatarFallback>
              </Avatar>
              <span className="text-sm theme-text-muted font-medium">
                {event.managers?.[0]?.name || t("eventCard.organizer") || "Organisateur"}
              </span>
            </div>
            <div>{getStatusBadge()}</div>
          </CardHeader>

          <CardContent className="p-4 pt-0 flex-1">
            <Link href={`/manager/events/${event.id}`} className="block">
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold theme-text-primary hover:opacity-80 transition-opacity line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-sm theme-text-muted line-clamp-3">{event.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm theme-text-muted">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className={isFull ? "text-destructive font-medium" : ""}>
                      {currentParticipants}
                      {hasMaxCapacity ? `/${event.maxCapacity}` : ""}
                      {isFull && <span className="ml-1 text-xs">(Complet)</span>}
                    </span>
                  </div>
                </div>
                {event.category && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge className="text-xs font-medium theme-text-accent border theme-border hover:opacity-80 transition-opacity">
                      {event.category}
                    </Badge>
                  </div>
                )}
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-2 flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0 flex-1">
              {event.participants && event.participants.length > 0 ? (
                <div className="flex -space-x-2">
                  {event.participants.slice(0, 4).map((participant) => {
                    const user = participant.user
                    if (!user) return null
                    return (
                      <Avatar
                        key={participant.id}
                        className="h-8 w-8 border-2 border-background transition-transform hover:scale-110"
                        title={user.name}
                      >
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    )
                  })}
                  {event.participants.length > 4 && (
                    <div
                      className="h-8 w-8 rounded-full theme-bg-muted border-2 border-background flex items-center justify-center text-xs font-medium theme-text-muted"
                      title={`${event.participants.length - 4} autres participants`}
                    >
                      +{event.participants.length - 4}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm theme-text-muted">
                  {t("eventCard.noParticipants") || "Aucun participant"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {isLoadingAction ? <LoadingSpinner size="sm" /> : <MoreHorizontal className="h-4 w-4" />}
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="theme-adaptive-popover">
                  <DropdownMenuItem asChild>
                    <Link href={`/manager/events/${event.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir l'événement
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/manager/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(event)} disabled={isLoadingAction}>
                    {event.status === EventStatus.PUBLISHED ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {event.status === EventStatus.PUBLISHED ? "Dépublier" : "Publier"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(event)} disabled={isLoadingAction}>
                    <Copy className="h-4 w-4 mr-2" />
                    Dupliquer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(event)}
                    disabled={isLoadingAction}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}
