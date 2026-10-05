import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getDashboardStats } from "@/services/dashboard.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getDashboardStats(session.uid)
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error("[dashboard/stats]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
