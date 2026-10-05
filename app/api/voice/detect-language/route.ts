import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { detectLanguageFromScript } from "@/lib/voice/detect-language"
import { fromValseaLanguageName } from "@/lib/i18n/languages"
import { valseaTranslate } from "@/lib/valsea/client"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { text } = body as { text?: string }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      )
    }

    const trimmed = text.trim().slice(0, 1200)
    const fromScript = detectLanguageFromScript(trimmed)
    if (fromScript) {
      return NextResponse.json({
        success: true,
        data: { language: fromScript, method: "script" as const },
      })
    }

    try {
      const result = await valseaTranslate({
        text: trimmed,
        target: "english",
        source: "auto",
      })
      const fromValsea =
        fromValseaLanguageName(result.sourceLanguage) ?? "en"

      return NextResponse.json({
        success: true,
        data: {
          language: fromValsea,
          method: "valsea" as const,
        },
      })
    } catch {
      return NextResponse.json({
        success: true,
        data: { language: "en" as SupportedLanguage, method: "fallback" as const },
      })
    }
  } catch (error) {
    console.error("[voice/detect-language]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Language detection failed",
      },
      { status: 500 }
    )
  }
}
