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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSelector showText />
        <ThemeSwitcher />
      </div>

      {/* Hero Section */}
      <section className="relative flex-grow min-h-screen flex items-center justify-center overflow-hidden pb-20 md:pb-0">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(132,204,22,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-20 max-w-screen-xl">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* ThreeScene container - now first on mobile, last on desktop */}
            <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] relative flex items-center justify-center pointer-events-none order-first lg:order-last">
              <ThreeScene />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            {/* Text content container - now last on mobile, first on desktop */}
            <div className="space-y-6 md:space-y-8 animate-fade-in text-center lg:text-left relative z-20 order-last lg:order-first">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary border border-primary/20 shadow-sm">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  {t("home.newVersion")}
                </div>
           <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
  <span
    className="bg-clip-text text-transparent"
    style={{ color: "var(--primary)" }}
  >
    {t("home.title")}
  </span>
</h1>

                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {t("home.subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {user ? t("home.accessDashboard") : t("home.getStarted")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!user && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/30 hover:bg-background/90 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Link href="/auth/login">{t("home.signIn")}</Link>
                  </Button>
                )}
              </div>
              {user && (
                <div className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 backdrop-blur-sm max-w-md mx-auto lg:mx-0 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium">
                          {t("home.loggedInAs")} <strong className="text-primary">{user.username}</strong>
                        </p>
                        <span className="px-2 py-0.5 bg-primary/20 rounded-full text-xs font-medium text-primary">
                          {user.name}
                        </span>
                      </div>
                    </div>
                    <div className="group relative flex items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full w-8 h-8 p-0 border-primary/40 hover:bg-primary/10 flex items-center justify-center bg-transparent"
                        onClick={handleLogout}
                        aria-label={t("auth.logout")}
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded px-2 py-1 transition-opacity whitespace-nowrap z-20">
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
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 mt-auto">
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
                <span className="font-bold text-xl gradient-text">TeamwillEvents</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("home.footerDescription")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t("home.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.featuresLink")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.pricing")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.api")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.integrations")}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t("home.support")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.documentation")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.guides")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.faqLink")}</span>
                </li>
                <li>
                  <span className="text-muted-foreground cursor-not-allowed">{t("home.contact")}</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t("home.contactUs")}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
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
          <div className="border-t border-border/50 mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Teamwill. {t("home.rightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
