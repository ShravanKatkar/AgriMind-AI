import { getAsianLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

const WELCOME_AUTO =
  "Welcome! Speak in your mother tongue — Hindi, Marathi, English. AgriMind detects what you say and answers in the same language."

const WELCOME_BY_CODE: Partial<Record<SupportedLanguage, string>> = {
  en: "Hello! Tap the microphone and ask your farming question. AgriMind replies with audio.",
  hi: "नमस्ते! माइक्रोफ़ोन दबाएँ और अपना कृषि प्रश्न पूछें। AgriMind आपकी आवाज़ समझता है और उत्तर देता है।",
  mr: "नमस्कार! मायक्रोफोनवर टॅप करा आणि आपला शेतीविषयक प्रश्न विचारा. AgriMind आपल्या प्रश्नाचे उत्तर देईल.",
}

export function getVoiceWelcomeMessage(
  code: SupportedLanguage | "auto"
): string {
  if (code === "auto") return WELCOME_AUTO

  const specific = WELCOME_BY_CODE[code]
  if (specific) return specific

  const info = getAsianLanguage(code)
  const label = info?.nativeLabel ?? info?.label ?? code
  return `Welcome! Tap the microphone and ask your farming question in ${label}.`
}
