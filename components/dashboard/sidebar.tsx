"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Sprout,
  Camera,
  Mic,
  LineChart,
  CloudSun,
  MessageSquare,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  ShoppingBag,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import {
  SHELL_BOTTOM_NAV_ITEMS,
  SHELL_NAV_ITEMS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"
import { toast } from "sonner"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  crops: Sprout,
  diagnosis: Camera,
  history: FileText,
  voice: Mic,
  market: LineChart,
  sell: ShoppingBag,
  weather: CloudSun,
  chat: MessageSquare,
  reminders: Bell,
  settings: Settings,
  profile: User,
} as const

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const { t, language } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    await signOut()
    toast.success(t("auth.signedOut"))
    router.push("/login")
    router.refresh()
  }

  function label(key: UiCatalogKey) {
    return t(key)
  }

  return (
    <aside
      key={language}
      data-no-translate
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:block",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <AgriMindLogo
              size="md"
              href="/dashboard"
              className="[&_span]:text-sidebar-foreground"
            />
          )}
          {collapsed && (
            <AgriMindLogo
              size="md"
              iconOnly
              href="/dashboard"
              className="mx-auto"
            />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {SHELL_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.icon]
              const isActive = pathname === item.href
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                    title={collapsed ? label(item.key) : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{label(item.key)}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border py-4 px-2">
          <ul className="space-y-1">
            {SHELL_BOTTOM_NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.icon]
              const isActive = pathname === item.href
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                    title={collapsed ? label(item.key) : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{label(item.key)}</span>}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                title={collapsed ? label("nav.signOut") : undefined}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label("nav.signOut")}</span>}
              </button>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary/90 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
