"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  FileText,
  LogOut,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import {
  SHELL_BOTTOM_NAV_ITEMS,
  SHELL_NAV_ITEMS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const NAV_ICONS: Record<string, LucideIcon> = {
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
}

type DashboardNavListProps = {
  onNavigate?: () => void
  variant?: "sidebar" | "sheet"
}

export function DashboardNavList({
  onNavigate,
  variant = "sidebar",
}: DashboardNavListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const { t } = useLanguage()

  const isSheet = variant === "sheet"

  async function handleSignOut() {
    await signOut()
    toast.success(t("auth.signedOut"))
    onNavigate?.()
    router.push("/login")
    router.refresh()
  }

  function linkClass(active: boolean) {
    if (isSheet) {
      return cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:bg-muted"
      )
    }
    return cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    )
  }

  function renderItem(
    key: UiCatalogKey,
    href: string,
    iconName: string
  ) {
    const Icon = NAV_ICONS[iconName] ?? LayoutDashboard
    const active = pathname === href
    return (
      <li key={key}>
        <Link
          href={href}
          onClick={onNavigate}
          className={linkClass(active)}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{t(key)}</span>
        </Link>
      </li>
    )
  }

  return (
    <nav className={cn(isSheet && "space-y-6")} data-no-translate>
      <ul className="space-y-1">
        {SHELL_NAV_ITEMS.map((item) =>
          renderItem(item.key, item.href, item.icon)
        )}
      </ul>
      <ul className={cn("space-y-1", isSheet && "border-t border-border pt-4")}>
        {SHELL_BOTTOM_NAV_ITEMS.map((item) =>
          renderItem(item.key, item.href, item.icon)
        )}
        <li>
          <button
            type="button"
            onClick={handleSignOut}
            className={linkClass(false)}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>{t("nav.signOut")}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
