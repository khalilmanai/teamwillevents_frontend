"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { EventCard } from "@/components/ui/event-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthUser } from "@/hooks/useAuthUser"
import { AlertCircle, Calendar, Users } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  registeredCount: number
  category: string
  imageUrl?: string
  maxParticipants?: number
  participants?: Array<{ id: string; user?: { name: string; avatarUrl?: string } }>
}

export default function RegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthUser()
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return; // no user, no fetch
      
      try {
        setLoading(true)
        setError(null)
        // Call backend endpoint without user ID in the URL, just query params
        const data = await apiService.getMyEvents({ page: 1, limit: 10 }) 
        setEvents(data.data) // Assuming response shape { data, total, page, limit }
      } catch (err) {
        console.error("Failed to load registrations", err)
        setError("Failed to load your registrations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    

    fetchEvents()
  }, [user?.id])

  const handleCancel = async (eventId: string) => {
    try {
      // Optimistic update
      setEvents(prev => prev.filter(e => e.id !== eventId))
      await apiService.cancelParticipation(eventId)
    } catch (err) {
      console.error("Cancel failed:", err)
      setError("Failed to cancel registration. Please try again.")
      // In a real app, you might want to restore the event here
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <LoadingSpinner className="h-12 w-12" />
          <h2 className="text-xl font-semibold">{t("registrations.loading")}</h2>
          <p className="text-muted-foreground">
            {t("registrations.fetchingEvents")}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">{t("errors.somethingWentWrong")}</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button onClick={() => window.location.reload()}>{t("common.tryAgain")}</Button>
        </div>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-4">
          <div className="relative">
            <Calendar className="h-24 w-24 text-muted-foreground/50" />
            <div className="absolute -bottom-2 -right-2 bg-background border-2 border-muted rounded-full p-1">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("registrations.noRegistrations")}</h2>
            <p className="text-muted-foreground">
              You haven't registered for any events yet. Browse our upcoming events and join the ones that interest you!
            </p>
          </div>
          <Link href="/employee/events">
            <Button size="lg" className="mt-4">
              <Calendar className="mr-2 h-4 w-4" />
              {t("registrations.browseEvents")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("registrations.myRegistrations")}</h1>
        <p className="text-muted-foreground">
          You're registered for {events.length} {events.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={{
              ...event,
              maxParticipants: event.capacity,
              participants: Array.from({ length: event.registeredCount }, (_, i) => ({
                id: `mock-${i}`,
                user: { name: `Participant ${i + 1}` }
              }))
            }}
            userId={user.id}
            showActions={true}
            onCancel={() => handleCancel(event.id)}
          />
        ))}
      </div>
    </div>
  )
}