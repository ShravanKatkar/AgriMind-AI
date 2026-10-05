import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  getMarketPrices,
  getMarketLocations,
  getChartHistory,
  getMarketMeta,
  processMarketAlerts,
} from "@/services/market.service"
import { getUserByFirebaseUid } from "@/services/user.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const prices = await getMarketPrices()
    const [locations, chartData] = await Promise.all([
      getMarketLocations(),
      getChartHistory(["Tomato", "Onion", "Rice", "Chili"]),
    ])

    await processMarketAlerts(session.uid).catch(() => {})

    const user = await getUserByFirebaseUid(session.uid)
    const meta = getMarketMeta(prices)

    return NextResponse.json({
      success: true,
      data: {
        prices,
        locations,
        chartData,
        lastUpdated: meta.lastUpdated ?? new Date(),
        priceSource: meta.priceSource,
        dataAsOf: meta.dataAsOf,
        stale: meta.stale,
        openAiConfigured: meta.openAiConfigured,
        primaryCrops: user?.primaryCrops ?? [],
      },
    })
  } catch (error) {
    console.error("[market GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load market data" },
      { status: 500 }
    )
  }
}
