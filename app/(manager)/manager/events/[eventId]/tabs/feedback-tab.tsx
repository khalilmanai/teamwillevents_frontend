import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n"

interface FeedbackTabProps {
  event: any
  t: any
}

export function FeedbackTab({ event }: { event: any }) {
  const { t } = useLanguage()
  const [feedbacks] = useState([
    { id: 1, user: "John Doe", rating: 5, comment: "Amazing event! Well organized and great speakers." },
    { id: 2, user: "Jane Smith", rating: 4, comment: "Good event but could use better venue acoustics." },
    { id: 3, user: "Mike Johnson", rating: 5, comment: "Excellent networking opportunities and valuable content." }
  ])

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t("events.eventFeedback")}
            <Badge variant="outline">{feedbacks.length}</Badge>
          </CardTitle>
          <CardDescription>
            {t("events.feedbackDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-4 bg-gradient-to-r from-green-50 to-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{feedback.user[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{feedback.user}</span>
                    <div className="flex">
                      {Array.from({length: 5}, (_, i) => (
                        <span key={i} className={`text-sm ${i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
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