"use client"

import { useRouter, usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthUser } from "@/hooks/useAuthUser"
import { Header } from "@/components/layout/header"
import type { Role } from "@/lib/roles"
import { roleRoutes } from "@/lib/roles"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"

interface RoleProtectedLayoutProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function RoleProtectedLayout({ allowedRoles, children }: RoleProtectedLayoutProps) {
  const { user, loading } = useAuthUser()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return
    if (!user) {
      if (pathname !== "/auth/login") {
        router.replace("/auth/login")
      }
    } else if (!allowedRoles.includes(user.role as Role)) {
      if (user.role && typeof user.role === "string" && user.role in roleRoutes) {
        const redirectPath = roleRoutes[user.role as Role].default
        if (!pathname.startsWith(redirectPath)) {
          router.replace(redirectPath)
        }
      }
    }
  }, [user, loading, allowedRoles, pathname, router, mounted])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isMounted) {
    return <div>Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role as Role)) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    apiService.logout()
    router.replace("/auth/login")
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Logo */}
      <div
        className="fixed inset-0 -z-10 opacity-[.20] bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: "url('/logo-teamwill.png')" }}
      />

      <Header user={user} onLogout={handleLogout} />
      <main className="mx-auto px-20 py-8">{children}</main>
    </div>
  )
}
