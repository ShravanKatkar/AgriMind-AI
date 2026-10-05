import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { generateMarketInsights } from "@/services/market.service"
import { getUserByFirebaseUid } from "@/services/user.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByFirebaseUid(session.uid)
    const insights = await generateMarketInsights(user?.primaryCrops)

    return NextResponse.json({ success: true, data: insights })
  } catch (error) {
    console.error("[market/insights]", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 }
    )
  }
}
