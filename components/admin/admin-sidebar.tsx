"use client"

import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { AdminNavList } from "@/components/admin/admin-nav-list"

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 flex-col justify-center gap-0.5 border-b border-sidebar-border px-4">
          <AgriMindLogo
            size="md"
            href="/admin"
            className="[&_span]:text-sidebar-foreground"
          />
          <p className="text-xs text-sidebar-foreground/60">Admin Console</p>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-4">
          <AdminNavList />
        </nav>
      </div>
    </aside>
  )
}
