import { EnhancedParticipantsList } from "@/components/event-components/enhanced-participants-list"
import { Card } from "@/components/ui/card" // Card is imported but not used in the original, I'll add it for consistency

interface ParticipantsTabProps {
  event: any
  t: any
}

export function ParticipantsTab({ event, t }: ParticipantsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {" "}
      {/* Increased gap for better spacing */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100 rounded-xl">
        {" "}
        {/* Added Card wrapper for consistent styling */}
        <EnhancedParticipantsList
          title={t("events.participants")}
          users={event.participants}
          emptyLabel={t("events.noParticipants")}
          color="green"
        />
      </Card>
      <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100 rounded-xl">
        {" "}
        {/* Added Card wrapper for consistent styling */}
        <EnhancedParticipantsList
          title={t("events.confirmedParticipants")}
          users={event.confirmedParticipants}
          emptyLabel={t("events.noConfirmedParticipants")}
          color="green"
        />
      </Card>
    </div>
  )
}
