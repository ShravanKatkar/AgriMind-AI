import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getFarmingAssistantReply } from "@/services/ai.service"
import type { SupportedLanguage } from "@/types"

/** Voice & quick assist — same OpenAI brain as chat */
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
    const { message, language, history } = body as {
      message?: string
      language?: SupportedLanguage
      history?: { role: "user" | "assistant"; content: string }[]
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const lang: SupportedLanguage = language ?? "en"
    const result = await getFarmingAssistantReply(
      message.trim(),
      lang,
      history ?? []
    )

    return NextResponse.json({
      success: true,
      data: {
        reply: result.reply,
        replyEnglish: result.replyEnglish,
      },
    })
  } catch (error) {
    console.error("[ai/assist]", error)
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
