"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav"
import { DashboardNavList } from "@/components/dashboard/dashboard-nav-list"
import { ThemeToggleRow } from "@/components/layout/theme-toggle"
import { LanguagePicker } from "@/components/i18n/language-picker"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-h-screen flex-col transition-all duration-300 lg:pl-64">
        <DashboardHeader onOpenMobileMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <DashboardMobileNav onOpenMenu={() => setMenuOpen(true)} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="sr-only">AgriMind AI menu</SheetTitle>
            <AgriMindLogo size="md" href="/dashboard" />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <DashboardNavList
              variant="sheet"
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
          <div className="space-y-3 border-t border-border p-4" data-no-translate>
            <LanguagePicker />
            <ThemeToggleRow />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
