"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin/nav"
import { destroySession, signOutFirebase } from "@/services/auth.service"
import { toast } from "sonner"

type AdminNavListProps = {
  onNavigate?: () => void
  variant?: "sidebar" | "sheet"
}

export function AdminNavList({
  onNavigate,
  variant = "sidebar",
}: AdminNavListProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isSheet = variant === "sheet"

  async function handleLogout() {
    await destroySession("admin")
    await signOutFirebase()
    toast.success("Signed out")
    onNavigate?.()
    router.push("/admin/login")
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

  return (
    <div className="flex h-full flex-col">
      <ul className="space-y-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={linkClass(active)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className={cn("mt-auto", isSheet ? "pt-4" : "border-t border-sidebar-border p-3")}>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            linkClass(false),
            "w-full",
            !isSheet && "text-sidebar-foreground/70"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
