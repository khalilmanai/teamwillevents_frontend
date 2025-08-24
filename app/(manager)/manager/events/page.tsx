"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import type { Event } from "@/lib/types"

export default function ManagerEventsListPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiService.getEvents()
        setEvents(data)
      } catch (error) {
        // handle error
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[300px]"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">{t("events.title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/manager/events/${event.id}`} className="block">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-sm mb-2">{event.date} {event.time}</div>
                <div className="mb-2 font-medium">{event.location}</div>
                <div className="text-xs">{event.description}</div>
                <div className="mt-2 text-xs text-muted-foreground">{t("events.status")}: {t(`events.${event.status}`)}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
