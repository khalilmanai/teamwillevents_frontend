'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { useEffect } from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Add smooth transition class for theme changes
    const style = document.createElement('style')
    style.textContent = `
      .theme-transitioning * {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    fill 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark', 'ecoplus', 'ecoplus-dark']}
      value={{
        light: 'light',
        dark: 'dark',
        ecoplus: 'ecoplus',
        'ecoplus-dark': 'ecoplus-dark',
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
