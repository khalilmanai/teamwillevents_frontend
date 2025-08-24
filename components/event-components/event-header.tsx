"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface EventHeaderProps {
  event: {
    title: string
    status: string
    startDate?: string
    location?: string
    participantCount?: number
    description?: string
  }
}

export function EventHeader({ event }: EventHeaderProps) {
  const { t } = useLanguage()

  return (
    <Card className="border-0 shadow-lg bg-card overflow-hidden rounded-md">
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-primary/80 via-primary/60 to-primary/30 p-8 relative n rounded-md">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary-foreground mb-3 leading-tight">{event.title}</h1>
              <p className="text-primary-foreground/90 text-lg font-medium mb-4">{t("events.managementDashboard")}</p>
              {event.description && (
                <p className="text-primary-foreground/80 text-base max-w-3xl leading-relaxed">{event.description}</p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold hover:scale-105 transition-transform duration-200"
            >
              {event.status}
            </Badge>
          </div>

          {/* Event Meta Information */}
          <div className="flex flex-wrap gap-6 text-primary-foreground/90">
            {event.startDate && (
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">{event.startDate}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">{event.location}</span>
              </div>
            )}
            {event.participantCount && (
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-200">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {event.participantCount} {t("participants")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-muted/50 px-8 py-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {t("lastUpdated")}: {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="text-primary font-medium">{t("activeManagement")}</div>
        </div>
      </div>
    </Card>
  )
}