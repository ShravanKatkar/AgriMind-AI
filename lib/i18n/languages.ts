/**
 * Supported languages: English, Hindi, Marathi.
 */
export type LanguageRegion =
  | "default"
  | "south_asia"

export interface AsianLanguage {
  code: string
  label: string
  nativeLabel: string
  region: LanguageRegion
  /** Valsea translation / transcription target name */
  valsea: string
  /** BCP-47 for browser speech synthesis fallback */
  bcp47?: string
}

export const ASIAN_LANGUAGES: readonly AsianLanguage[] = [
  { code: "en", label: "English", nativeLabel: "English", region: "default", valsea: "english", bcp47: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", region: "south_asia", valsea: "hindi", bcp47: "hi-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", region: "south_asia", valsea: "marathi", bcp47: "mr-IN" },
] as const

export type SupportedLanguage = (typeof ASIAN_LANGUAGES)[number]["code"]

/** Voice UI: let VALSEA detect spoken language automatically */
export const AUTO_DETECT_LANGUAGE = "auto" as const
export type VoiceLanguagePreference =
  | SupportedLanguage
  | typeof AUTO_DETECT_LANGUAGE

export function isAutoDetectLanguage(
  value: string
): value is typeof AUTO_DETECT_LANGUAGE {
  return value === AUTO_DETECT_LANGUAGE
}

export const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = ASIAN_LANGUAGES.map(
  (l) => l.code as SupportedLanguage
)

export const LANGUAGE_REGION_LABELS: Record<LanguageRegion, string> = {
  default: "English",
  south_asia: "Regional Languages",
}

const byCode = new Map(ASIAN_LANGUAGES.map((l) => [l.code, l]))

export function getAsianLanguage(code: string): AsianLanguage | undefined {
  return byCode.get(code)
}

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return byCode.has(code)
}

export function toValseaLanguageName(code: string): string {
  return getAsianLanguage(code)?.valsea ?? code
}

/**
 * Use VALSEA.ai speech-to-text (not browser Web Speech).
 * Browser STT is unreliable for Marathi, Hindi, etc.; English can use the browser.
 */
export function prefersValseaVoiceTranscription(
  code: VoiceLanguagePreference | string
): boolean {
  if (code === AUTO_DETECT_LANGUAGE || code === "auto") return true
  if (code === "en") return false
  return isSupportedLanguage(code)
}

export function fromValseaLanguageName(name?: string): SupportedLanguage | null {
  if (!name?.trim()) return null
  const key = name.toLowerCase().trim()
  const match = ASIAN_LANGUAGES.find(
    (l) =>
      l.valsea === key ||
      l.code === key ||
      l.label.toLowerCase() === key ||
      l.nativeLabel.toLowerCase() === key
  )
  return match ? (match.code as SupportedLanguage) : null
}

export function getLanguageDisplayLabel(code: string): string {
  const lang = getAsianLanguage(code)
  if (!lang) return code
  return lang.nativeLabel !== lang.label
    ? `${lang.nativeLabel}`
    : lang.label
}

/** Dropdown list grouped by region (for header / landing) */
export function getLanguagesByRegion(): {
  region: LanguageRegion
  label: string
  languages: AsianLanguage[]
}[] {
  const regions: LanguageRegion[] = [
    "default",
    "south_asia",
  ]
  return regions.map((region) => ({
    region,
    label: LANGUAGE_REGION_LABELS[region],
    languages: ASIAN_LANGUAGES.filter((l) => l.region === region),
  }))
}
