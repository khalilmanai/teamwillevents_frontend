"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus, Calendar, Users, MessageSquare, TrendingUp, Search, Filter, Edit, Import } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import type { Event } from "@/lib/types"
import { EventStatus } from "@/lib/event-status"
import { useLanguage } from "@/lib/i18n"

import { useAuthUser } from "@/hooks/useAuthUser"
import { ManagerEventCard } from "@/components/ui/manager-event-card"

type FilterStatus = "all" | "published" | "draft" | "archived"
type SortBy = "date" | "participants" | "status" | "title"

export default function MarketingDashboard() {
  const { t } = useLanguage()
  const user = useAuthUser()

  // State management
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [sortBy, setSortBy] = useState<SortBy>("date")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // Tracks which event is loading an action

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      const eventsData = await apiService.getEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => {
        switch (statusFilter) {
          case "published":
            return event.status === EventStatus.PUBLISHED
          case "draft":
            return event.status === EventStatus.PENDING
          case "archived":
            return event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "participants":
          return (b.currentParticipants || 0) - (a.currentParticipants || 0)
        case "status":
          return a.status.localeCompare(b.status)
        case "date":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    setFilteredEvents(filtered)
  }, [events, searchQuery, statusFilter, sortBy])

  // Event actions
  const handleDeleteEvent = async (eventId: string) => {
    try {
      setActionLoading(eventId)
      await apiService.deleteEvent(eventId)
      await fetchEvents()
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
      setShowDeleteDialog(false)
      setEventToDelete(null)
    }
  }

  const handleDuplicateEvent = async (event: Event) => {
    try {
      setActionLoading(event.id)
      await apiService.duplicateEvent(event.id)
      await fetchEvents()
      toast({
        title: "Success",
        description: "Event duplicated successfully.",
      })
    } catch (error) {
      console.error("Error duplicating event:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (event: Event) => {
    try {
      setActionLoading(event.id)
      const newStatus = event.status === EventStatus.PUBLISHED ? EventStatus.PENDING : EventStatus.PUBLISHED
      await apiService.updateEventStatus(event.id, newStatus)
      await fetchEvents()
      toast({
        title: "Success",
        description: `Event ${newStatus === EventStatus.PUBLISHED ? "published" : "unpublished"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating event status:", error)
      toast({
        title: "Error",
        description: "Failed to update event status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate stats
  const publishedEvents = events.filter(event => event.status === EventStatus.PUBLISHED);
const draftEvents = events.filter(event => event.status === EventStatus.PENDING);

// Calculate total participants from the participants array length
const totalParticipants = publishedEvents.reduce((sum, event) => {
  const participants = event.participants ? event.participants.length : 0;
  return sum + participants;
}, 0);

// Calculate total max capacity
const totalMaxParticipants = publishedEvents.reduce((sum,  event) => {
  return sum + (event.maxCapacity || 0);
}, 0);

// Calculate participation rate
const participationRate =
  publishedEvents.length > 0 && totalMaxParticipants > 0
    ? Math.round((totalParticipants / totalMaxParticipants) * 100)
    : 0;

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}


  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("navigation.dashboard")}</h1>
          <p className="text-muted-foreground">{t("dashboard.manageEvents")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/manager/events/create">
              <Plus className="h-4 w-4 mr-2" />
              {t("navigation.createEvent")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("events.eventsPublished")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedEvents.length}</div>
            <p className="text-xs text-muted-foreground">+{draftEvents.length} en brouillon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("events.totalParticipants")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Toutes inscriptions confondues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("events.participationRate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <p className="text-xs text-muted-foreground">{t("events.participationRateOverall")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button
              asChild
              variant="outline"
              className="h-24 flex-col justify-center items-center bg-transparent hover:bg-accent/50"
            >
              <Link href="/manager/events/create" className="flex flex-col items-center justify-center h-full w-full">
                <Plus className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">{t("manager.createEvent")}</span>
              </Link>
            </Button>
            {/* Add more quick actions here if needed */}
            <Button
              variant="outline"
              className="h-24 flex-col justify-center items-center bg-transparent hover:bg-accent/50"
              onClick={() => setStatusFilter("draft")}
            >
              <Edit className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Voir les brouillons</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col justify-center items-center bg-transparent hover:bg-accent/50"
              onClick={() => setSortBy("participants")}
            >
              <Users className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Trier par participants</span>
            </Button>
                     <Button
              variant="outline"
              className="h-24 flex-col justify-center items-center bg-transparent hover:bg-accent/50"
              onClick={() => setSortBy("participants")}
            >
              <Import className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">importer des utilisateurs</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Tous les événements ({filteredEvents.length})</h2>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des événements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: FilterStatus) => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px] shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[150px] shrink-0">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Par date</SelectItem>
                  <SelectItem value="title">Par titre</SelectItem>
                  <SelectItem value="participants">Par participants</SelectItem>
                  <SelectItem value="status">Par statut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="min-h-[300px] flex items-center justify-center">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {events.length === 0 ? t("manager.noEvents") : "Aucun événement trouvé"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {events.length === 0
                  ? t("manager.createFirstEvent")
                  : "Essayez de modifier vos critères de recherche ou filtres."}
              </p>
              {events.length === 0 && (
                <Button asChild>
                  <Link href="/manager/events/create">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("manager.createEvent")}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <ManagerEventCard
                key={event.id}
                event={event}
                userId={user.id}
                onDelete={() => {
                  setEventToDelete(event)
                  setShowDeleteDialog(true)
                }}
                onDuplicate={handleDuplicateEvent}
                onToggleStatus={handleToggleStatus}
                isLoadingAction={actionLoading === event.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.title}" ? Cette action est irréversible et
              supprimera également toutes les inscriptions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
