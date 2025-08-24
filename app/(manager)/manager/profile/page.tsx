"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ProfileForm } from "@/components/profile/profile-form"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import type { User } from "@/lib/types"
import Link from "next/link"

export default function MarketingProfilePage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-md">
        <LoadingSpinner size="lg" className="text-emerald-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-emerald-50 rounded-2xl shadow-md p-8">
        <p className="text-emerald-800 text-lg font-semibold mb-4">{t("common.error")}</p>
        <Button
          variant="outline"
          className="border-emerald-500 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
          onClick={() => window.location.reload()}
        >
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6 md:p-8  rounded-2xl shadow-lg mt-6 mb-6 border border-emerald-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-emerald-100 transition-colors"
            onClick={() => window.history.back()}
            aria-label={t("common.back") + " button"}
          >
            <ArrowLeft className="h-5 w-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("profile.title")}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">{t("profile.subtitle")}</p>
          </div>
        </div>
        <img
          src="/logo-teamwill.png"
          alt="Logo"
          className="h-10 w-10 rounded-full shadow-sm   hover:scale-105 transition-transform"
        />
      </div>

      {/* Profile Form */}
      <div className=" rounded-xl shadow-sm p-4 sm:p-6 md:p-8 ">
        <ProfileForm user={user} onUserUpdate={handleUserUpdate} />
      </div>
    </div>
  )
}