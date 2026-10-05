import { ASIAN_LANGUAGES, type SupportedLanguage } from "@/lib/i18n/languages"

const MARATHI_MARKERS = /\b(आहे|नाही|काय|कसे|कशी|कसा|माझे|माझ्या|शेतकरी|पिकावर|झाले|पडले|होते|करावे|द्यावे|सांगा|रोगावर)\b|ळ/i
const HINDI_MARKERS = /\b(है|हैं|नहीं|क्या|कैसे|कैसा|कैसी|मेरा|मेरी|मेरे|किसान|फसल|पत्ते|उपचार|दीजिए|बताइए)\b/i

/** Fast local guess from Unicode script / vocabulary */
export function detectLanguageFromScript(
  text: string
): SupportedLanguage | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  // Check Devanagari (Hindi / Marathi)
  const hasDevanagari = /[\u0900-\u097F]/.test(trimmed)
  if (hasDevanagari) {
    if (MARATHI_MARKERS.test(trimmed)) return "mr"
    if (HINDI_MARKERS.test(trimmed)) return "hi"
    return "hi"
  }

  const latinOnly = /^[\x00-\x7F\s\d\p{P}]+$/u.test(trimmed)
  if (latinOnly) return "en"

  return null
}

export function normalizeDetectedLanguage(
  code: string | null | undefined
): SupportedLanguage {
  if (!code) return "en"
  const lower = code.toLowerCase()
  const byCode = ASIAN_LANGUAGES.find((l) => l.code === lower)
  return (byCode?.code as SupportedLanguage) ?? "en"
}

/** Client: detect language from user message (voice or typed) */
export async function detectUserLanguage(
  text: string
): Promise<SupportedLanguage> {
  const script = detectLanguageFromScript(text)
  if (script) return script

  try {
    const res = await fetch("/api/voice/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    const json = await res.json()
    if (res.ok && json.data?.language) {
      return normalizeDetectedLanguage(json.data.language)
    }
  } catch {
    /* fallback */
  }

  return "en"
}
