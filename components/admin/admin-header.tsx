"use client"

import { Menu, Search } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { AdminProfileMenu } from "@/components/admin/admin-profile-menu"

type AdminHeaderProps = {
  onOpenMobileMenu?: () => void
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-12 items-center gap-2 px-3 lg:hidden">
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
          href="/admin"
          className="min-w-0 flex-1 [&_span]:truncate [&_span]:text-sm"
          imageClassName="!h-8 !w-8"
        />
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <AdminProfileMenu />
        </div>
      </div>

      <div className="mx-auto hidden h-14 w-full max-w-[1440px] items-center gap-4 px-4 sm:h-16 sm:px-6 lg:flex">
        <div className="relative min-w-0 max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search farmers, reports…"
            className="h-9 border-0 bg-muted/60 pl-9 focus-visible:bg-background focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <AdminProfileMenu />
        </div>
      </div>
    </header>
  )
}
