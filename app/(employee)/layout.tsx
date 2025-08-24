"use client"

import type React from "react"
import { RoleProtectedLayout } from "@/components/auth/role-protected-layout"

import { ThemeProvider } from "@/components/theme-provider"
import { ROLES } from "@/lib/roles"

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
<RoleProtectedLayout allowedRoles={[ROLES.EMPLOYEE]} >
        {children}
      </RoleProtectedLayout>
    </ThemeProvider>
  )
}
