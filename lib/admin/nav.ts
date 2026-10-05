import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Sprout,
  BarChart3,
  Bell,
  UserCog,
  Brain,
} from "lucide-react"

export type AdminNavItem = {
  name: string
  href: string
  icon: LucideIcon
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Farmers", href: "/admin/farmers", icon: Users },
  { name: "Crop Reports", href: "/admin/reports", icon: Sprout },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Officers", href: "/admin/officers", icon: UserCog },
  { name: "AI Monitor", href: "/admin/ai-monitor", icon: Brain },
]

export function isAdminNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href))
}
