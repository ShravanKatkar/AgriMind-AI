import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import type { SupportedLanguage } from "@/types"

/**
 * POST /api/voice/speak
 *
 * Server-side TTS has been removed (previously used OpenAI TTS which is paid).
 * The client now uses the browser's built-in Web Speech API for free TTS.
 *
 * This endpoint returns the text back with a flag indicating the client
 * should use browser-native speechSynthesis instead.
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { text, language } = body as {
      text?: string
      language?: SupportedLanguage
    }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      )
    }

    // Return text for client-side browser TTS instead of audio buffer
    return NextResponse.json({
      success: true,
      useBrowserTTS: true,
      text: text.trim(),
      language: language ?? "en",
    })
  } catch (error) {
    console.error("[voice/speak]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Speech synthesis failed",
      },
      { status: 500 }
    )
  }
}
