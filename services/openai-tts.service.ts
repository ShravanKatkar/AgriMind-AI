import type { SupportedLanguage } from "@/types"

const MAX_TTS_CHARS = 4096

export function truncateForTts(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TTS_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_TTS_CHARS - 1)}…`
}

/**
 * TTS is now handled entirely on the client side using the browser's
 * built-in Web Speech API (speechSynthesis). This server-side function
 * is kept as a stub that returns null to signal the client to use
 * browser TTS instead.
 *
 * This eliminates the need for paid OpenAI TTS API calls.
 */
export async function synthesizeSpeech(
  text: string,
  language?: SupportedLanguage
): Promise<Buffer | null> {
  // Return null to signal client-side TTS should be used instead
  // Browser Web Speech API handles TTS for free across all languages
  return null
}
