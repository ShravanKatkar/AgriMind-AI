import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export function getChatWelcomeMessage(language: SupportedLanguage): string {
  const label = getLanguageDisplayLabel(language)

  if (language === "en") {
    return `Hello! I'm AgriMind — your farming assistant.

Ask about crop diseases, fertilizers, pests, weather, and local farming tips. Type your question or tap the green mic to speak.

How can I help you today?`
  }

  return `Hello! I'm AgriMind — your farming assistant.

Replies appear in ${label}. Ask about crops, diseases, weather, and local farming practices. Type or tap the mic to speak.

How can I help you today?`
}
