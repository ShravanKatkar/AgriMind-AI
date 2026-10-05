import { NextResponse } from "next/server"
import { LIVE_TRANSLATE_MAX_STRINGS } from "@/lib/i18n/translation-policy"
import type { SupportedLanguage } from "@/types"

export const maxDuration = 60

/**
 * Legacy endpoint — UI mode returns English unchanged.
 * Live mode redirects clients to POST /api/translate/live (OpenAI).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { texts, target, mode } = body as {
      texts?: string[]
      target?: SupportedLanguage
      mode?: "live" | "ui"
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { success: false, error: "texts array is required" },
        { status: 400 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: "target language is required" },
        { status: 400 }
      )
    }

    if (target === "en" || mode !== "live") {
      return NextResponse.json({
        success: true,
        data: { translations: texts },
      })
    }

    if (texts.length > LIVE_TRANSLATE_MAX_STRINGS) {
      return NextResponse.json(
        {
          success: false,
          error: `Use /api/translate/live (max ${LIVE_TRANSLATE_MAX_STRINGS} strings).`,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Use POST /api/translate/live for dynamic translation.",
      },
      { status: 410 }
    )
  } catch (error) {
    console.error("[valsea/translate-batch]", error)
    return NextResponse.json(
      { success: false, error: "Batch translation failed" },
      { status: 500 }
    )
  }
}
