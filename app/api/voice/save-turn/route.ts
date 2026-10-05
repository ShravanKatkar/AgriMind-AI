import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { saveVoiceTurn } from "@/services/voice.service"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, language, userMessage, assistantMessage } = body as {
      conversationId?: string
      language?: SupportedLanguage
      userMessage?: { content: string; transcript?: string }
      assistantMessage?: { content: string }
    }

    if (!userMessage?.content || !assistantMessage?.content) {
      return NextResponse.json(
        { success: false, error: "Messages are required" },
        { status: 400 }
      )
    }

    const result = await saveVoiceTurn({
      firebaseUid: session.uid,
      language: language ?? "en",
      conversationId,
      userMessage,
      assistantMessage,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[voice/save-turn]", error)
    return NextResponse.json(
      { success: false, error: "Failed to save conversation" },
      { status: 500 }
    )
  }
}
