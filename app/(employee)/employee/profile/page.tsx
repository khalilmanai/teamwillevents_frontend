"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/profile/profile-form"
import { RoleProtectedLayout } from "@/components/auth/role-protected-layout"

import { useLanguage } from "@/lib/i18n"
import { useAuthUser } from "@/hooks/useAuthUser"
import { ROLES } from "@/lib/roles"

interface User {
  id: string
  name: string
  email: string
  role: string
  // Add any other fields your form needs
}

export default function EmployeeProfilePage() {
  const { t } = useLanguage()
  const { user, isLoading, setUser } = useAuthUser()

  const handleUserUpdate = (updatedUser: User) => {
    // Update local/global auth state
    if (setUser) {
      setUser(updatedUser)
    }

    // Show success toast
    toast.success(t("profile.updateSuccess"), {
      description: t("profile.updateSuccessDesc") || "", // Optional
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <p className="text-muted-foreground text-sm">{t("common.error")}</p>
      </div>
    )
  }

  return (


      <section className="max-w-4xl mx-auto space-y-8 px-4 sm:px-0">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/employee" aria-label={t("common.back")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("common.back")}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
              <p className="text-muted-foreground">{t("profile.subtitle")}</p>
            </div>
          </div>
        </header>

        {/* Profile Form */}
        <ProfileForm user={user} onUserUpdate={handleUserUpdate} />
      </section>

  )
}
