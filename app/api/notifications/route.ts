import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
} from "@/services/notification.service"
import { processDueReminders } from "@/services/reminder-scheduler.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await processDueReminders(session.uid).catch(() => {})

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.uid, 30),
      getUnreadCount(session.uid),
    ])

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    })
  } catch (error) {
    console.error("[notifications GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load notifications" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await markAllNotificationsRead(session.uid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[notifications POST]", error)
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications read" },
      { status: 500 }
    )
  }
}
