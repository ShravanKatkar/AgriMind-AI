import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getFarmingAssistantReply } from "@/services/ai.service"
import type { SupportedLanguage } from "@/types"

/** Backward-compatible alias — uses OpenAI (same as /api/ai/assist) */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, language } = body as {
      message?: string
      language?: SupportedLanguage
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const lang: SupportedLanguage = language ?? "en"
    const result = await getFarmingAssistantReply(message.trim(), lang)

    return NextResponse.json({
      success: true,
      data: {
        reply: result.reply,
        replyEnglish: result.replyEnglish,
      },
    })
  } catch (error) {
    console.error("[valsea/assist]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Assistant failed",
      },
      { status: 500 }
    )
  }
}
