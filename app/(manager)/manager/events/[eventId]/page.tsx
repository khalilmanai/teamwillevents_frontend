"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import type { Event } from "@/lib/types"
import { EventHeader } from "@/components/event-components/event-header"
import { EventTabs } from "@/components/event-components/event-tabs"
import { OverviewTab } from "./tabs/overview-tab"
import { ParticipantsTab } from "./tabs/participants-tab"
import { FeedbackTab } from "./tabs/feedback-tab"
import { LoadingState } from "@/components/event-components/loading-state"
import { ErrorState } from "@/components/event-components/error-state"
import { TasksTab } from "./tabs/tasks-tab"
import ChatWindow from "@/app/chat/chat-window"
import { CostCalculator } from "./tabs/cost-calculator-tab"
import StatisticsTab from "./tabs/statistics-tab"

export default function ManagerEventDetailsPage() {
  const { t } = useLanguage()
  const { eventId } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function load() {
      try {
        const data = await apiService.getEvent(eventId as string)
        setEvent(data)
      } catch (err) {
        console.error("Failed to load event:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [eventId])

  if (loading) return <LoadingState />
  if (!event) return <ErrorState t={t} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-card/50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <EventHeader event={event} />

        <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm">
          <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="space-y-6">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {activeTab === "overview" && (
              <div className="p-6">
                <OverviewTab event={event} setEvent={setEvent} t={t} />
              </div>
            )}

            {activeTab === "participants" && (
              <div className="p-6">
                <ParticipantsTab event={event} t={t} />
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="p-6">
                <FeedbackTab event={event} t={t} />
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="p-6">
                <TasksTab eventId={event.id} t={t} />
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="p-6">
                <StatisticsTab eventId={event.id} t={t} />
              </div>
            )}

            {activeTab === "chat" && (
              <div className="p-6">
                <ChatWindow eventId={event.id} />
              </div>
            )}

            {activeTab === "costs" && (
              <div className="p-6">
                <CostCalculator eventId={event.id} budget={event.budget} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
