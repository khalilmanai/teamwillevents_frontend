"use client"

import { useLanguage } from "@/lib/i18n"
import { useEffect } from "react"

export function DynamicLayout() {
  const { language, t } = useLanguage()

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = language
    
    // Update document title and meta description
    document.title = t("home.title") || "TeamwillEvents - Event Management Platform"
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        language === 'fr' 
          ? "Plateforme moderne de gestion d'événements pour les entreprises avec chat en temps réel et création par commande vocale"
          : "Modern event management platform for businesses with real-time chat and voice command creation"
      )
    }
  }, [language, t])

  return null
}