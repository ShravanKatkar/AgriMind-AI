import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { processVoiceTurn } from "@/services/voice.service"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, language, conversationId, transcript, history } = body as {
      message?: string
      language?: SupportedLanguage
      conversationId?: string
      transcript?: string
      history?: ChatMessageInput[]
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const result = await processVoiceTurn({
      firebaseUid: session.uid,
      message: message.trim(),
      language: language ?? "en",
      conversationId,
      transcript,
      history,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[voice/turn]", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Voice turn failed",
      },
      { status: 500 }
    )
  }
}
