"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ChevronsUpDown, UserX } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as UserType } from "@/lib/types"
import { useLanguage } from "@/lib/i18n"

interface UserDropdownProps {
  users: UserType[]
  selectedUserId?: string
  onUserSelect: (userId: string | undefined) => void
  placeholder?: string
  allowUnassigned?: true
  className?: string
  size?: "sm" | "default" | "lg"
}

export function UserDropdown({
  users,
  selectedUserId,
  onUserSelect,
  placeholder,
  allowUnassigned = true,
  className = "",
  size = "default",
}: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  
  const defaultPlaceholder = placeholder || t("profileAssignment.selectUser")

  const selectedUser = users.find((user) => user.id === selectedUserId)

  const handleSelect = (userId: string | undefined) => {
    onUserSelect(userId)
    setOpen(false)
  }

  const sizeClasses = {
    sm: "h-8 text-xs",
    default: "h-10 text-sm",
    lg: "h-12 text-base",
  }

  const avatarSizes = {
    sm: "h-5 w-5",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between font-normal hover:bg-accent/50 transition-colors",
            sizeClasses[size],
            selectedUser ? "text-foreground" : "text-muted-foreground",
            className,
          )}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className={avatarSizes[size]}>
                <AvatarImage
                  src={selectedUser.avatarUrl || `/placeholder.svg?height=32&width=32`}
                  alt={selectedUser.username || selectedUser.email}
                />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {selectedUser.username?.charAt(0).toUpperCase() || selectedUser.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium truncate max-w-full">
                  {selectedUser.username || selectedUser.email.split("@")[0]}
                </span>
                {selectedUser.username && (
                  <span className="text-xs text-muted-foreground truncate max-w-full">{selectedUser.email}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={cn("rounded-full bg-muted flex items-center justify-center", avatarSizes[size])}>
                <UserX className="h-3 w-3 text-muted-foreground" />
              </div>
              <span>{defaultPlaceholder}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={t("profileAssignment.searchUsers")} className="h-9" />
          <CommandList>
            <CommandEmpty>{t("profileAssignment.noUsersFound")}</CommandEmpty>
            <CommandGroup>
              {allowUnassigned && (
                <CommandItem
                  value="unassigned"
                  onSelect={() => handleSelect(undefined)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <UserX className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium">{t("profileAssignment.unassigned")}</span>
                    <span className="text-xs text-muted-foreground">{t("profileAssignment.noUserAssigned")}</span>
                  </div>
                  <Check className={cn("ml-auto h-4 w-4", !selectedUserId ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              )}
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.username || ""} ${user.email}`}
                  onSelect={() => handleSelect(user.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={user.avatarUrl || `/placeholder.svg?height=32&width=32`}
                      alt={user.username || user.email}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{user.username || user.email.split("@")[0]}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                  <Check className={cn("ml-auto h-4 w-4", selectedUserId === user.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
