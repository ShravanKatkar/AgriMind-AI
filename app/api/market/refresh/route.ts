import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { refreshMarketPricesFromAI } from "@/services/market.service"

export async function POST() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await refreshMarketPricesFromAI()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Updated ${result.updated} crops (AI estimate as of ${result.asOf})`,
    })
  } catch (error) {
    console.error("[market/refresh]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh prices. Check OPENAI_API_KEY.",
      },
      { status: 500 }
    )
  }
}
