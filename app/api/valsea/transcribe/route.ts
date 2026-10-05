import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  checkValseaRateLimit,
  recordValseaRequest,
  setValseaCooldown,
} from "@/lib/valsea/rate-limit"
import { transcribeAudio } from "@/services/valsea.service"
import type { SupportedLanguage } from "@/types"

import { isValseaConfigured } from "@/lib/valsea/config"

export async function POST(request: Request) {
  try {
    if (isValseaConfigured()) {
      const limit = checkValseaRateLimit()
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Voice service is busy (rate limit). Please wait a minute and try again.",
            retryAfterMs: limit.retryAfterMs,
          },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
          }
        )
      }
    }

    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const rawLang = (formData.get("language") as string) ?? "auto"
    const language =
      rawLang === "auto" ? "auto" : ((rawLang as SupportedLanguage) ?? "en")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "Audio file is required" },
        { status: 400 }
      )
    }

    if (isValseaConfigured()) {
      recordValseaRequest()
    }
    const result = await transcribeAudio(
      file,
      language,
      file instanceof File ? file.name : "recording.webm"
    )

    return NextResponse.json({
      success: true,
      data: {
        text: result.clarifiedText || result.text,
        raw: result.rawTranscript,
      },
    })
  } catch (error) {
    console.error("[valsea/transcribe]", error)
    const message =
      error instanceof Error ? error.message : "Transcription failed"
    if (/rate limit|429|too many/i.test(message)) {
      setValseaCooldown(60_000)
      return NextResponse.json(
        {
          success: false,
          error: "Valsea rate limit reached. Try again in one minute.",
          retryAfterMs: 60_000,
        },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
