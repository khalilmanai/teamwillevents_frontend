import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { UserCard } from "../profile/user-card"

interface EnhancedParticipantsListProps {
  title: string
  users?: any[]
  emptyLabel: string
  color?: "green" | "emerald"
}

export function EnhancedParticipantsList({
  title,
  users,
  emptyLabel,
  color = "green"
}: EnhancedParticipantsListProps) {
  const colorClasses = {
    green: "from-green-500/10 to-green-600/5 border-green-200",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-200"
  }

  return (
    <Card className={`border-2 bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {title}
          {users && users.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {users.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users && users.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((participant, index) => {
              const user = participant.user || participant
              return (
                <HoverCard key={participant.id}>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-4 p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-200 cursor-pointer">
                      <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
                        <AvatarImage src={user.avatarUrl || "/placeholder-user.jpg"} alt={user.name || user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-sm font-medium">
                          {user.name?.[0] || user.email?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/manager/user-profile?userId=${user.id}`} 
                          className="block font-medium text-foreground hover:text-primary transition-colors truncate"
                        >
                          {user.name || user.email}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.job} • {user.department}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        #{index + 1}
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80" align="start" sideOffset={5}>
                    <UserCard user={user} participant={participant} />
                  </HoverCardContent>
                </HoverCard>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground italic">{emptyLabel}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}