import { Mail, Phone, MapPin, User, MessageSquare } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface UserCardProps {
  user: {
    id: string
    name?: string
    email: string
    avatarUrl?: string
    job?: string
    department?: string
    phone?: string
    location?: string
  }

}

export function UserCard({ user, participant }: UserCardProps) {
  return (
    <div className="space-y-3">
      {/* User Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-14 h-14 mt-1">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="text-lg">
            {user.name?.[0] || user.email?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-lg">{user.name || user.email}</h4>
          {user.job && <p className="text-sm text-muted-foreground">{user.job}</p>}
          {user.department && <p className="text-xs text-muted-foreground">{user.department}</p>}
 
        </div>
      </div>

      <Separator />

      {/* Contact Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm break-all">{user.email}</p>
          </div>
        </div>

        {user.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm">{user.phone}</p>
            </div>
          </div>
        )}

        {user.location && (
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm">{user.location}</p>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
          <Link href={`/manager/user-profile?userId=${user.id}`}>
            <User className="w-4 h-4" />
            Profile
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-2">
          <MessageSquare className="w-4 h-4" />
          Message
        </Button>
      </div>
    </div>
  )
}