import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { updateReminder, deleteReminder } from "@/services/reminder.service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const reminder = await updateReminder(session.uid, id, {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    })

    if (!reminder) {
      return NextResponse.json({ success: false, error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: reminder })
  } catch (error) {
    console.error("[reminders/id PATCH]", error)
    return NextResponse.json({ success: false, error: "Failed to update reminder" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ok = await deleteReminder(session.uid, id)
    if (!ok) {
      return NextResponse.json({ success: false, error: "Reminder not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[reminders/id DELETE]", error)
    return NextResponse.json({ success: false, error: "Failed to delete reminder" }, { status: 500 })
  }
}
