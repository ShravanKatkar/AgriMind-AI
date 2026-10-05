import type { SupportedLanguage } from "@/types"

/** Languages with full dashboard menu translations (no API on switch). */
export const FULL_UI_LANGUAGES: SupportedLanguage[] = ["hi", "mr"]

/** Short labels for language picker headers. */
export const TRANSLATION_SERVICE_COPY = {
  appLanguageTitle: "App language",
  appLanguageSubtitle:
    "Menus: Hindi & Marathi built-in.",
  voiceTitle: "VALSEA.ai voice",
  voiceSubtitle: "Speech-to-text for Voice Assistant & mic in AI Chat",
  chatLanguageSubtitle: "Reply language · mic uses VALSEA.ai",
  profileLanguageSubtitle:
    "Dashboard menus + diagnosis reports · voice uses VALSEA.ai",
  diagnosisNote:
    "Disease reports translate via OpenAI when you change language.",
} as const

export function hasFullDashboardUi(lang: SupportedLanguage): boolean {
  return FULL_UI_LANGUAGES.includes(lang)
}
