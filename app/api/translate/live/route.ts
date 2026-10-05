import { NextResponse } from "next/server"
import {
  getCachedServerTranslation,
  setCachedServerTranslation,
} from "@/lib/i18n/server-translation-cache"
import { LIVE_TRANSLATE_MAX_STRINGS } from "@/lib/i18n/translation-policy"
import { resolveStaticTexts } from "@/lib/i18n/resolve-static"
import { translateTextsWithOpenAI } from "@/services/openai-translate.service"
import type { SupportedLanguage } from "@/types"

export const maxDuration = 60

/**
 * Live text translation — OpenAI only (never Valsea).
 * Used for diagnosis reports and other dynamic content.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { texts, target, source } = body as {
      texts?: string[]
      target?: SupportedLanguage
      source?: SupportedLanguage | "auto"
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

    if (target === "en") {
      return NextResponse.json({
        success: true,
        data: { translations: texts, provider: "none" },
      })
    }

    if (texts.length > LIVE_TRANSLATE_MAX_STRINGS) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many strings (max ${LIVE_TRANSLATE_MAX_STRINGS}). Try again shortly.`,
        },
        { status: 400 }
      )
    }

    const src = source ?? "en"
    const { resolved, missingIndices } = resolveStaticTexts(target, texts)

    if (missingIndices.length === 0) {
      return NextResponse.json({
        success: true,
        data: { translations: resolved, provider: "static" },
      })
    }

    const toTranslate: string[] = []
    const translateIndexes: number[] = []
    for (const i of missingIndices) {
      const text = texts[i]?.trim() ?? ""
      const cached = getCachedServerTranslation(target, src, text)
      if (cached) {
        resolved[i] = cached
      } else {
        toTranslate.push(text)
        translateIndexes.push(i)
      }
    }

    if (toTranslate.length > 0) {
      const fromOpenAI = await translateTextsWithOpenAI(toTranslate, target, src)
      fromOpenAI.forEach((translated, j) => {
        const idx = translateIndexes[j]!
        const original = texts[idx]!
        resolved[idx] = translated
        setCachedServerTranslation(target, src, original, translated)
      })
    }

    return NextResponse.json({
      success: true,
      data: { translations: resolved, provider: "openai" },
    })
  } catch (error) {
    console.error("[translate/live]", error)
    const message =
      error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
