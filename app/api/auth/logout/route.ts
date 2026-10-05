import { NextResponse } from "next/server"
import { COOKIE_NAMES } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const type = body.type ?? "all"

    const response = NextResponse.json({ success: true })

    if (type === "user" || type === "all") {
      response.cookies.set(COOKIE_NAMES.session, "", {
        maxAge: 0,
        path: "/",
      })
    }

    if (type === "admin" || type === "all") {
      response.cookies.set(COOKIE_NAMES.adminSession, "", {
        maxAge: 0,
        path: "/",
      })
    }

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    )
  }
}
