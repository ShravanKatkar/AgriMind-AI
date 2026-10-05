import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { listPlatformNotifications } from "@/services/admin.service"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const data = await listPlatformNotifications(50)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[admin/notifications]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load notifications" },
      { status: 500 }
    )
  }
}
