import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { seedSampleCropsForUser } from "@/services/crop.service"

export async function POST() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await seedSampleCropsForUser(session.uid)

    return NextResponse.json({
      success: true,
      data: {
        created: result.created,
        skipped: result.skipped,
        crops: result.crops,
      },
    })
  } catch (error) {
    console.error("[crops/seed POST]", error)
    return NextResponse.json(
      { success: false, error: "Failed to add sample crops" },
      { status: 500 }
    )
  }
}
