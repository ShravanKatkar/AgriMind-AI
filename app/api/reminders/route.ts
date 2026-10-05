import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { listReminders, createReminder } from "@/services/reminder.service"

export async function GET(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCompleted = searchParams.get("completed") === "true"

    const reminders = await listReminders(session.uid, includeCompleted)
    return NextResponse.json({ success: true, data: reminders })
  } catch (error) {
    console.error("[reminders GET]", error)
    return NextResponse.json({ success: false, error: "Failed to load reminders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.title?.trim() || !body.dueDate) {
      return NextResponse.json(
        { success: false, error: "Title and due date are required" },
        { status: 400 }
      )
    }

    const reminder = await createReminder({
      firebaseUid: session.uid,
      cropId: body.cropId,
      title: body.title.trim(),
      description: body.description,
      type: body.type ?? "other",
      priority: body.priority ?? "medium",
      dueDate: new Date(body.dueDate),
      dueTime: body.dueTime,
      repeat: body.repeat ?? "none",
      notifyChannels: body.notifyChannels ?? ["app"],
    })

    return NextResponse.json({ success: true, data: reminder }, { status: 201 })
  } catch (error) {
    console.error("[reminders POST]", error)
    return NextResponse.json({ success: false, error: "Failed to create reminder" }, { status: 500 })
  }
}
