import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { COOKIE_NAMES } from "@/lib/constants"

export async function GET() {
  try {
    const user = await getSessionUser(COOKIE_NAMES.adminSession)
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized" },
        { status: 401 }
      )
    }
    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin" },
      { status: 500 }
    )
  }
}
