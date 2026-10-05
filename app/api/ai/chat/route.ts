import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { isSupportedLanguage } from "@/lib/i18n/languages"
import { getMultilingualFarmingReply } from "@/services/valsea.service"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

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
      history?: ChatMessageInput[]
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const lang: SupportedLanguage =
      language && isSupportedLanguage(language) ? language : "en"
    const result = await getMultilingualFarmingReply(
      message.trim(),
      lang,
      history ?? []
    )

    return NextResponse.json({
      success: true,
      data: {
        reply: result.reply,
        replyEnglish: result.replyEnglish,
        language: lang,
      },
    })
  } catch (error) {
    console.error("[ai/chat]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Chat request failed",
      },
      { status: 500 }
    )
  }
}
