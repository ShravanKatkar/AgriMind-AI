"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminNavList } from "@/components/admin/admin-nav-list"
import { ThemeToggleRow } from "@/components/layout/theme-toggle"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-h-screen flex-col transition-all duration-300 lg:pl-64">
        <AdminHeader onOpenMobileMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <AgriMindLogo size="md" href="/admin" />
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            <AdminNavList
              variant="sheet"
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
          <div className="border-t border-border p-4" data-no-translate>
            <ThemeToggleRow onToggle={() => setMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
