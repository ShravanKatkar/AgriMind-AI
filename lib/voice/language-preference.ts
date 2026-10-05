import {
  AUTO_DETECT_LANGUAGE,
  isAutoDetectLanguage,
  isSupportedLanguage,
  type VoiceLanguagePreference,
} from "@/lib/i18n/languages"

const STORAGE_KEY = "agrimind-voice-language-mode"

export function getStoredVoiceLanguageMode(): VoiceLanguagePreference {
  if (typeof window === "undefined") return AUTO_DETECT_LANGUAGE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return AUTO_DETECT_LANGUAGE
    if (isAutoDetectLanguage(raw)) return AUTO_DETECT_LANGUAGE
    if (isSupportedLanguage(raw)) return raw
  } catch {
    /* ignore */
  }
  return AUTO_DETECT_LANGUAGE
}

export function setStoredVoiceLanguageMode(mode: VoiceLanguagePreference): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}
