"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, Search, Filter, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EventCard } from "@/components/ui/event-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { apiService } from "@/lib/api"
import type { Event } from "@/lib/types"
import { isEventUpcoming } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthUser } from "@/hooks/useAuthUser"

export default function EmployeeDashboard() {
  const { t } = useLanguage()
  const { user } = useAuthUser()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "upcoming" | "registered">("upcoming")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    const fetchEventsAndParticipation = async () => {
      try {
        const [eventsData, participations] = await Promise.all([
          apiService.getEvents(),
          user?.id ? apiService.getUserParticipations(user.id) : [],
        ])

        const enrichedEvents = eventsData.map((event) => {
          const match = participations.find((p) => p.eventId === event.id)
          return {
            ...event,
            isRegistered: !!match,
        
          }
        })

        setEvents(enrichedEvents)
        setFilteredEvents(enrichedEvents)
      } catch (error) {
        console.error("Failed to load events or participation:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) fetchEventsAndParticipation()
  }, [user?.id])

  useEffect(() => {
    let filtered = [...events]

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lower) ||
          event.description.toLowerCase().includes(lower) ||
          event.location.toLowerCase().includes(lower) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(lower))
      )
    }

    if (filter === "upcoming") {
      filtered = filtered.filter(
        (event) =>
          isEventUpcoming(event.date, event.time) && event.status === "published"
      )
    } else if (filter === "registered") {
      filtered = filtered.filter((event) => event.isRegistered)
    } else {
      filtered = filtered.filter((event) => event.status === "published")
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.category === categoryFilter || event.tags?.includes(categoryFilter)
      )
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, filter, categoryFilter])

  const handleRegister = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isRegistered: true,
              currentParticipants: event.currentParticipants + 1,
            }
          : event
      )
    )
  }

  const upcomingEvents = events.filter(
    (event) => isEventUpcoming(event.date, event.time) && event.status === "published"
  )
  const registeredEvents = events.filter((event) => event.isRegistered)

  const categories = Array.from(
    new Set(events.flatMap((event) => event.tags || []))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("events.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("events.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("events.searchEvents")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder={t("events.allCategories")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("events.allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          title={t("events.upcoming")}
          value={upcomingEvents.length}
          sub={t("events.availableEvents")}
        />
        <StatsCard
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          title={t("navigation.myRegistrations")}
          value={registeredEvents.length}
          sub={t("events.registeredEvents")}
        />
        <StatsCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          title={t("events.thisWeek")}
          value={
            upcomingEvents.filter((event) => {
              const d = new Date(event.date)
              const now = new Date()
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
              return d >= now && d <= weekFromNow
            }).length
          }
          sub={t("events.eventsThisWeek")}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="upcoming" onClick={() => setFilter("upcoming")}>
            {t("events.upcoming")}
          </TabsTrigger>
          <TabsTrigger value="registered" onClick={() => setFilter("registered")}>
            {t("events.myRegistrations")}
          </TabsTrigger>
          <TabsTrigger value="all" onClick={() => setFilter("all")}>
            {t("events.all")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Events */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center">
          <CardContent className="p-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("events.noEventsFound")}</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? t("events.noSearchResults")
                : filter === "registered"
                ? t("events.noRegisteredEvents")
                : t("events.noAvailableEvents")}
            </p>
            {searchTerm && (
              <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm("")}>
                {t("events.resetSearch")}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              userId={user.id}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatsCard({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode
  title: string
  value: number
  sub: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
