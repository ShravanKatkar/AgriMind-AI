import { NextResponse } from "next/server"
import { getValseaApiKey, getValseaBaseUrl } from "@/lib/valsea/config"
import { getValseaRateLimitStatus } from "@/lib/valsea/rate-limit"
import { TEXT_TRANSLATION_USES_OPENAI } from "@/lib/i18n/translation-policy"

/** Check Valsea + rate limit status (does not expose API key). */
export async function GET() {
  const key = getValseaApiKey()
  return NextResponse.json({
    success: true,
    data: {
      configured: Boolean(key),
      baseUrl: getValseaBaseUrl(),
      textTranslationProvider: TEXT_TRANSLATION_USES_OPENAI ? "openai" : "valsea",
      valseaReservedFor: "voice-transcribe",
      rateLimit: getValseaRateLimitStatus(),
    },
  })
}
