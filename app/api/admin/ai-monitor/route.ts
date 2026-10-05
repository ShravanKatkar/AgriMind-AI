import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { getAiMonitorData } from "@/services/admin.service"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const data = await getAiMonitorData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[admin/ai-monitor]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load AI monitor data" },
      { status: 500 }
    )
  }
}
