import type { SupportedLanguage } from "@/lib/i18n/languages"
import {
  blockLiveTranslation,
  canRequestLiveTranslation,
  getLiveTranslationCooldownMs,
  recordLiveTranslationBatch,
} from "@/lib/i18n/client-rate-limit"
import {
  LIVE_TRANSLATE_CHUNK_SIZE,
  LIVE_TRANSLATE_MIN_INTERVAL_MS,
} from "@/lib/i18n/translation-policy"

let lastLiveBatchAt = 0
let inFlight: Promise<string[]> | null = null
let inFlightKey = ""

function canRunByInterval(): boolean {
  return Date.now() - lastLiveBatchAt >= LIVE_TRANSLATE_MIN_INTERVAL_MS
}

function markInterval() {
  lastLiveBatchAt = Date.now()
}

async function fetchLiveChunk(
  texts: string[],
  target: SupportedLanguage
): Promise<string[]> {
  const res = await fetch("/api/translate/live", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target, source: "en" }),
  })
  const json = await res.json()

  if (res.status === 429) {
    const retryMs =
      typeof json.retryAfterMs === "number" ? json.retryAfterMs : 60_000
    blockLiveTranslation(retryMs)
    throw new Error("RATE_LIMIT")
  }

  if (!res.ok) {
    throw new Error(json.error ?? "Translation failed")
  }

  return (json.data?.translations as string[]) ?? texts
}

/**
 * Live translation for diagnosis only — OpenAI, cached, rate-limited.
 * Returns original strings on limit (no throw) when `softFail` is true.
 */
export async function fetchLiveTranslations(
  texts: string[],
  target: SupportedLanguage,
  options?: { softFail?: boolean }
): Promise<string[]> {
  if (texts.length === 0) return texts

  const softFail = options?.softFail !== false
  const requestKey = `${target}:${texts.join("\x1e")}`

  if (inFlight && inFlightKey === requestKey) {
    return inFlight
  }

  const cooldown = getLiveTranslationCooldownMs()
  if (cooldown > 0 || !canRequestLiveTranslation() || !canRunByInterval()) {
    if (softFail) return texts
    throw new Error("RATE_LIMIT")
  }

  const run = async (): Promise<string[]> => {
    const out: string[] = []
    try {
      for (let i = 0; i < texts.length; i += LIVE_TRANSLATE_CHUNK_SIZE) {
        const chunk = texts.slice(i, i + LIVE_TRANSLATE_CHUNK_SIZE)
        recordLiveTranslationBatch()
        markInterval()
        const part = await fetchLiveChunk(chunk, target)
        out.push(...part)
      }
      return out
    } catch (err) {
      if (err instanceof Error && err.message === "RATE_LIMIT") {
        if (softFail) return texts
      }
      throw err
    } finally {
      inFlight = null
      inFlightKey = ""
    }
  }

  inFlight = run()
  inFlightKey = requestKey
  return inFlight
}
