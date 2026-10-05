import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { generateVoiceFollowUps } from "@/services/voice-followup.service"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reply, language } = body as {
      reply?: string
      language?: SupportedLanguage
    }

    if (!reply?.trim()) {
      return NextResponse.json(
        { success: false, error: "Reply text is required" },
        { status: 400 }
      )
    }

    const questions = await generateVoiceFollowUps(
      reply.trim(),
      language ?? "en"
    )

    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    console.error("[voice/follow-ups]", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate follow-ups" },
      { status: 500 }
    )
  }
}
