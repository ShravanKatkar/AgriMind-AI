import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  createMarketAlert,
  listMarketAlerts,
} from "@/services/market.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const alerts = await listMarketAlerts(session.uid)
    return NextResponse.json({ success: true, data: alerts })
  } catch (error) {
    console.error("[market/alerts GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load alerts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { cropName, condition, targetPrice } = body as {
      cropName?: string
      condition?: "above" | "below"
      targetPrice?: number
    }

    if (!cropName || !condition || targetPrice == null) {
      return NextResponse.json(
        { success: false, error: "cropName, condition, and targetPrice are required" },
        { status: 400 }
      )
    }

    const alert = await createMarketAlert({
      firebaseUid: session.uid,
      cropName,
      condition,
      targetPrice: Number(targetPrice),
    })

    return NextResponse.json({ success: true, data: alert }, { status: 201 })
  } catch (error) {
    console.error("[market/alerts POST]", error)
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    )
  }
}
