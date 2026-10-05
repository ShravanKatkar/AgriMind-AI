import { NextResponse } from "next/server"
import { translateText } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

/** Single-string translation — OpenAI (not Valsea). */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, target, source } = body as {
      text?: string
      target?: SupportedLanguage
      source?: SupportedLanguage | "auto"
    }

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target language is required" },
        { status: 400 }
      )
    }

    const result = await translateText(text, target, source ?? "auto")

    return NextResponse.json({
      success: true,
      data: {
        translatedText: result.translatedText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        provider: "openai",
      },
    })
  } catch (error) {
    console.error("[valsea/translate]", error)
    const message =
      error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
