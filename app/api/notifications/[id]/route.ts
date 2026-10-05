import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { deleteNotification } from "@/services/notification.service"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteNotification(session.uid, id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notifications/id DELETE]", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
