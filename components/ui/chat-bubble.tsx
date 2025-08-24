"use client"

import type { ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/roles"
import { FileText, Download } from "lucide-react"

interface ChatBubbleProps {
  message: ChatMessage
  isCurrentUser: boolean
}

export function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderFileContent = () => {
    if (message.type === "image" && message.fileUrl) {
      return (
        <div className="mt-2">
          <img
            src={message.fileUrl || "/placeholder.svg"}
            alt="Shared image"
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.fileUrl, "_blank")}
          />
        </div>
      )
    }

    if (message.type === "file" && message.fileUrl) {
      return (
        <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2 max-w-xs">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm truncate flex-1">{message.fileName}</span>
          <button
            onClick={() => window.open(message.fileUrl, "_blank")}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className={cn("flex gap-3 mb-4 animate-fade-in", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">{message.userName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.userName}</span>
          <Badge variant={message.userRole === "manager" ? "default" : "secondary"} className="text-xs">
            {message.userRole === "manager" ? "manager" : "Employé"}
          </Badge>
          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
        </div>

        <div
          className={cn("max-w-md p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          {renderFileContent()}
        </div>
      </div>
    </div>
  )
}
