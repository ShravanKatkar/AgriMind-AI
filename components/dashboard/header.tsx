"use client"

import { Menu } from "lucide-react"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { DashboardGlobalSearch } from "@/components/dashboard/dashboard-global-search"
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown"
import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu"
import { LiveDateTime } from "@/components/dashboard/live-datetime"
import { ScrollHideBar } from "@/components/motion/scroll-hide-bar"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type DashboardHeaderProps = {
  onOpenMobileMenu?: () => void
}

function HeaderActions({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center",
        compact ? "gap-0.5" : "gap-1 sm:gap-1.5"
      )}
    >
      {!compact && (
        <div className="hidden sm:block">
          <LanguagePicker />
        </div>
      )}
      <ThemeToggle />
      <NotificationDropdown />
      <DashboardProfileMenu />
    </div>
  )
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { language } = useLanguage()

  return (
    <header
      key={language}
      data-no-translate
      className="sticky top-0 z-30 w-full border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="lg:hidden">
        <div className="flex h-12 items-center gap-2 px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <AgriMindLogo
            size="xs"
            href="/dashboard"
            className="min-w-0 flex-1 [&_span]:truncate [&_span]:text-sm"
            imageClassName="!h-8 !w-8"
          />

          <HeaderActions compact />
        </div>

        <ScrollHideBar className="border-t border-border/60 bg-muted/25">
          <div className="px-3 py-2">
            <LiveDateTime variant="mobile-bar" />
          </div>
        </ScrollHideBar>
      </div>

      <div className="mx-auto hidden h-14 w-full max-w-[1440px] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-5 lg:flex lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <LiveDateTime
            variant="compact"
            className="shrink-0 border-r border-border pr-3 sm:pr-4"
          />
          <DashboardGlobalSearch className="min-w-0 flex-1 max-w-none lg:max-w-2xl" />
        </div>
        <HeaderActions />
      </div>
    </header>
  )
}
