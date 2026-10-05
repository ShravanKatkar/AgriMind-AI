import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { listVoiceConversations } from "@/services/voice.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await listVoiceConversations(session.uid)
    return NextResponse.json({ success: true, data: conversations })
  } catch (error) {
    console.error("[voice/conversations GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load conversations" },
      { status: 500 }
    )
  }
}
