"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Camera,
  Mic,
  LineChart,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

const tabs = [
  { key: "nav.dashboard" as const, href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.diagnosis" as const, href: "/dashboard/diagnosis", icon: Camera },
  { key: "nav.voice" as const, href: "/dashboard/voice", icon: Mic },
  { key: "nav.market" as const, href: "/dashboard/market", icon: LineChart },
] as const

type DashboardMobileNavProps = {
  onOpenMenu: () => void
}

export function DashboardMobileNav({ onOpenMenu }: DashboardMobileNavProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] lg:hidden"
      data-no-translate
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span className="truncate max-w-full">{t(tab.key)}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  )
}
