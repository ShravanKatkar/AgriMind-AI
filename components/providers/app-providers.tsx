"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { AutoTranslateMain } from "@/components/i18n/auto-translate-main"
import { SiteHelpWidget } from "@/components/site-help/site-help-widget"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <LanguageProvider>
          <AutoTranslateMain>{children}</AutoTranslateMain>
          <SiteHelpWidget />
          <Toaster richColors position="top-right" closeButton />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
