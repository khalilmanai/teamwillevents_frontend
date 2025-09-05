"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ChevronDown, Mail, Phone, MapPin, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/lib/i18n"
import { apiService } from "@/lib/api"
import type { User } from "@/lib/types"
import ThreeScene from "@/components/three/hero-scene"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import ThemeSwitcher from "@/components/ui/theme-switcher"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateTime, setDateTime] = useState(new Date())
  const [isScreensaver, setIsScreensaver] = useState(false)
  const [lastMouseMove, setLastMouseMove] = useState(Date.now())
  const router = useRouter()
  const { t } = useLanguage()
  const isMobile = useIsMobile()

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await apiService.getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = () => {
      setLastMouseMove(Date.now())
      if (isScreensaver) {
        setIsScreensaver(false)
      }
    }

    const checkScreensaver = () => {
      const now = Date.now()
      const timeSinceLastMove = now - lastMouseMove
      if (timeSinceLastMove >= 60000 && !isScreensaver) {
        setIsScreensaver(true)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    const screensaverInterval = setInterval(checkScreensaver, 1000)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      clearInterval(screensaverInterval)
    }
  }, [isScreensaver, lastMouseMove])

  // Format date like "Aug-27th 3.47PM"
  const formatDateTime = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[date.getMonth()]
    const day = date.getDate()
    const daySuffix = (d: number) => {
      if (d > 3 && d < 21) return "th"
      switch (d % 10) {
        case 1: return "st"
        case 2: return "nd"
        case 3: return "rd"
        default: return "th"
      }
    }
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12 || 12
    return `${month}-${day}${daySuffix(day)} ${hours}.${minutes}${ampm}`
  }

  const formatDigitalTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }

  const handleGetStarted = () => {
    if (user) {
      router.push(user.role === "manager" ? "/manager" : "/employee")
    } else {
      router.push("/auth/login")
    }
  }

  const handleLogout = async () => {
    apiService.logout()
    setUser(null)
    router.replace("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg-muted">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 theme-text-primary"></div>
      </div>
    )
  }

  if (isScreensaver) {
    return (
      <div className="fixed inset-0 theme-bg-primary flex items-center justify-center z-50 cursor-none">
        <div className="text-center">
          <div className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-mono font-bold theme-text-primary-foreground tracking-wider">
            {formatDigitalTime(dateTime)}
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl theme-text-muted mt-4 font-light">
            {formatDateTime(dateTime)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <LanguageSelector showText />
        <ThemeSwitcher />
      </div>

      {/* Hero Section */}
      <section className="relative flex-grow min-h-screen flex items-center justify-center overflow-hidden pb-20 md:pb-0">
        <div className="absolute inset-0 theme-bg-muted">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--accent)/0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-20 max-w-screen-xl">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] relative flex items-center justify-center pointer-events-none order-first lg:order-last">
              <ThreeScene />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            <div className="space-y-6 md:space-y-8 animate-in fade-in text-center lg:text-left relative z-20 order-last lg:order-first">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center px-3 py-1 theme-bg-accent rounded-full text-sm font-medium theme-text-accent-foreground theme-border">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full theme-bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 theme-bg-primary"></span>
                  </span>
                  {formatDateTime(dateTime)}
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                  <span className="theme-text-primary">
                    {t("home.title")}
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl theme-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {t("home.subtitle")}
                </p>
              </div>
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-full theme-adaptive-button border-none transform hover:scale-105 theme-transition theme-shadow-md hover:theme-shadow-md"
                >
                  {user ? t("home.accessDashboard") : t("home.getStarted")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!user && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-full theme-bg-muted border-2 border-[rgba(var(--primary),0.3)] theme-text-primary transform hover:scale-105 theme-transition theme-shadow-md hover:theme-shadow-md"
                  >
                    <Link href="/auth/login">{t("home.signIn")}</Link>
                  </Button>
                )}
              </div>

              {/* Logged-in User Info */}
              {user && (
                <div className="p-4 md:p-6 theme-adaptive-card rounded-xl max-w-md mx-auto lg:mx-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 theme-bg-primary rounded-full animate-pulse" />
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium">
                          {t("home.loggedInAs")} <strong className="theme-text-primary">{user.username}</strong>
                        </p>
                        <span className="px-2 py-0.5 theme-bg-accent rounded-full text-xs font-medium theme-text-accent-foreground">
                          {user.name}
                        </span>
                      </div>
                    </div>
                    <div className="group relative flex items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full w-8 h-8 p-0 border-[rgba(var(--primary),0.4)] theme-text-primary hover:theme-bg-accent theme-transition flex items-center justify-center"
                        onClick={handleLogout}
                        aria-label={t("auth.logout")}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded px-2 py-1 theme-transition whitespace-nowrap z-20">
                        {t("auth.logout")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <ChevronDown className="h-6 w-6 theme-text-muted" />
        </div>
      </section>

      {/* Footer */}
      <footer className="theme-bg-card border-t theme-border mt-auto">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-screen-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo-teamwill.png"
                  alt="TeamwillEvents Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="font-bold text-xl theme-text-primary">TeamwillEvents</span>
              </div>
              <p className="theme-text-muted text-sm leading-relaxed">{t("home.footerDescription")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 theme-text-foreground">{t("home.product")}</h4>
              <ul className="space-y-2 text-sm theme-text-muted">
                <li>
                  <span className="cursor-not-allowed">{t("home.featuresLink")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.pricing")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.api")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.integrations")}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 theme-text-foreground">{t("home.support")}</h4>
              <ul className="space-y-2 text-sm theme-text-muted">
                <li>
                  <span className="cursor-not-allowed">{t("home.documentation")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.guides")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.faqLink")}</span>
                </li>
                <li>
                  <span className="cursor-not-allowed">{t("home.contact")}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 theme-text-foreground">{t("home.contactUs")}</h4>
              <div className="space-y-2 text-sm theme-text-muted">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{t("home.contactEmail")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{t("home.contactPhone")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t("home.contactLocation")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t theme-border mt-8 pt-6 text-center text-sm theme-text-muted">
            <p>&copy; 2025 Teamwill. {t("home.rightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}