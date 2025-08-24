"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { Header } from "@/components/layout/header"
import { useAuthUser } from "@/hooks/useAuthUser"
import { Settings as SettingsIcon, Bell, Palette, Languages, ChevronRight } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [emailNotif, setEmailNotif] = useState(false)
  const { user, isLoading } = useAuthUser()

  useEffect(() => {
    const notif = localStorage.getItem("emailNotif")
    if (notif) setEmailNotif(notif === "true")
  }, [])

  const handleNotifToggle = (checked: boolean) => {
    setEmailNotif(checked)
    localStorage.setItem("emailNotif", checked.toString())
    toast.success(
      checked ? t("settings.emailNotifOn") : t("settings.emailNotifOff")
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(
      newTheme === "dark"
        ? t("settings.themeDark")
        : newTheme === "light"
        ? t("settings.themeLight")
        : t("settings.themeSystem")
    )
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    toast.success(lang === "fr" ? "Langue changée en français" : "Language changed to English")
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-muted-foreground text-lg">{t("common.loading")}</span>
      </div>
    )
  }

  return (
    <>
      <Header user={user} onLogout={() => { localStorage.clear(); window.location.href = "/auth/login" }} />
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-fade-in-up">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 rounded-full bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
            <p className="text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-1 bg-background rounded-xl border border-muted overflow-hidden shadow-sm">
          {/* Notifications */}
          <div className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors border-b border-muted">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{t("settings.notifications")}</h3>
                <p className="text-sm text-muted-foreground">{t("settings.emailNotif")}</p>
              </div>
            </div>
            <Switch checked={emailNotif} onCheckedChange={handleNotifToggle} />
          </div>

          {/* Theme Selection */}
          <div className="p-5 hover:bg-muted/50 transition-colors border-b border-muted">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-foreground">{t("settings.theme")}</h3>
            </div>
            <div className="flex gap-2 ml-14">
              {["light", "dark", "system"].map((mode) => (
                <Button
                  key={mode}
                  variant={theme === mode ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleThemeChange(mode)}
                  className="rounded-lg"
                >
                  {t(`settings.${mode}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/50">
                <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-foreground">{t("settings.language")}</h3>
            </div>
            <div className="flex gap-2 ml-14">
              {["fr", "en"].map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "secondary"}
                  size="sm"
                  onClick={() => handleLanguageChange(lang)}
                  className="rounded-lg"
                >
                  {lang === "fr" ? "Français" : "English"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Settings (example) */}
        <div className="mt-8 space-y-1 bg-background rounded-xl border border-muted overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 dark:text-orange-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <span className="font-medium text-foreground">Privacy & Security</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 dark:text-pink-400">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <span className="font-medium text-foreground">Feedback</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </main>
    </>
  )
}