import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  getVoiceConversation,
  deleteVoiceConversation,
} from "@/services/voice.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const conversation = await getVoiceConversation(session.uid, id)
    if (!conversation) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: conversation })
  } catch (error) {
    console.error("[voice/conversations/id GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load conversation" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ok = await deleteVoiceConversation(session.uid, id)
    if (!ok) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[voice/conversations/id DELETE]", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    )
  }
}
