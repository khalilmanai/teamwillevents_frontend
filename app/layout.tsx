import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/lib/i18n"
import { ThemeProvider } from "@/components/theme-provider"
import { DynamicLayout } from "@/components/layout/dynamic-layout"
import "./globals.css"
import { Providers } from "@/components/providers/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TeamwillEvents - Event Management Platform",
  description:
    "Modern event management platform for businesses with real-time chat and voice command creation",
  keywords: ["events", "business", "management", "chat", "voice command", "événements", "entreprise", "gestion"],
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
<ThemeProvider
  attribute="class"
  value={{
    light: "light",
    dark: "dark",
    ecoplus: "ecoplus",
    "ecoplus-dark": "ecoplus-dark", // ✅ space-separated classes
  }}
  defaultTheme="light"
>


          <LanguageProvider>
            <DynamicLayout />
            <div className="min-h-screen">
              <Providers>
                {children}
              </Providers>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}