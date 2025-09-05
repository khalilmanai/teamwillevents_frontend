"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"

interface Feedback {
  id: string
  comment: string
  rating: number
  user: {
    id: string
    name: string
  }
}

interface FeedbackTabProps {
  eventId: string
}

export function FeedbackTab({ eventId }: FeedbackTabProps) {
  const { t } = useLanguage()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const data = await apiService.getFeedback(eventId)
        setFeedbacks(data)
      } catch (err) {
        console.error("Failed to fetch feedback:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [eventId])

  if (loading) return <p>{t("loading")}...</p>

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t("events.eventFeedback")}
            <Badge variant="outline">{feedbacks.length}</Badge>
          </CardTitle>
          <CardDescription>{t("events.feedbackDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-4 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {feedback.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{feedback.user.name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < feedback.rating ? "text-yellow-500" : "text-gray-300"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{feedback.comment}</p>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
