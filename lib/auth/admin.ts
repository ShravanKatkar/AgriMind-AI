import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { COOKIE_NAMES } from "@/lib/constants"
import type { SessionUser } from "@/types"

export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser(COOKIE_NAMES.adminSession)
  if (!user || user.role !== "admin") return null
  return user
}

export function adminUnauthorizedResponse() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getAdminUser()
  if (!user) return adminUnauthorizedResponse()
  return user
}
