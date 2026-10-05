import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { markNotificationRead } from "@/services/notification.service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ok = await markNotificationRead(session.uid, id)
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notifications/read]", error)
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
