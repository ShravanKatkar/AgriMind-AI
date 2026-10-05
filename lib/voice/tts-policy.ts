import type { SupportedLanguage } from "@/types"

export type SpeakStrategy = "instant" | "natural"

/** Farmer-facing languages that need server TTS (browser often has no native voice on Windows) */
const SERVER_TTS_LANGUAGES = new Set<SupportedLanguage>([
  "hi",
  "mr",
])

export function prefersServerTts(language: SupportedLanguage): boolean {
  return SERVER_TTS_LANGUAGES.has(language)
}

export function defaultSpeakStrategy(
  language: SupportedLanguage
): SpeakStrategy {
  return language === "en" ? "instant" : "natural"
}

/** OpenAI TTS pronunciation hint (gpt-4o-mini-tts) */
export function ttsInstructionsForLanguage(
  language: SupportedLanguage
): string | undefined {
  switch (language) {
    case "hi":
      return "Speak in Hindi (हिन्दी) with clear, natural Indian pronunciation. Do not use English accent."
    case "mr":
      return "Speak in Marathi (मराठी) with clear, natural Indian pronunciation. Do not use English accent."
    default:
      return undefined
  }
}
