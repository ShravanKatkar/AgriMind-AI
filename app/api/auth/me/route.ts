import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { COOKIE_NAMES } from "@/lib/constants"

export async function GET() {
  try {
    const user = await getSessionUser(COOKIE_NAMES.session)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      )
    }
    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
