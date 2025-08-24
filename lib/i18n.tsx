
"use client"


import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import fr from "./locales/fr"
import en from "./locales/en"

export const translations = { fr, en }

// Only allow 'en' or 'fr' as Language
export type Language = 'en' | 'fr'
export type TranslationKey = string

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Legacy hook for backward compatibility
export function useTranslation(lang: Language = "fr") {
  return {
    t: (key: string) => {
      const keys = key.split(".")
      let value: any = translations[lang]

      for (const k of keys) {
        value = value?.[k]
      }

      return value || key
    },
  }
}
