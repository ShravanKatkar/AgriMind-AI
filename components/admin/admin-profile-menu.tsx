"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Shield, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { destroySession, signOutFirebase } from "@/services/auth.service"
import { toast } from "sonner"
import type { SessionUser } from "@/types"

export function AdminProfileMenu() {
  const router = useRouter()
  const [admin, setAdmin] = useState<SessionUser | null>(null)

  useEffect(() => {
    fetch("/api/auth/admin/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAdmin(json.data)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await destroySession("admin")
    await signOutFirebase()
    toast.success("Signed out")
    router.push("/admin/login")
    router.refresh()
  }

  const initials = (admin?.displayName ?? "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/15"
          aria-label="Admin account menu"
        >
          <span className="text-xs font-semibold">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{admin?.displayName ?? "Admin"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {admin?.email ?? "admin@gamil.com"}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin" className="gap-2">
            <Shield className="h-4 w-4" />
            Admin overview
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Public website
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
