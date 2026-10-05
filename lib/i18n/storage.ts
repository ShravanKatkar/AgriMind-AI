import { isSupportedLanguage, type SupportedLanguage } from "@/lib/i18n/languages"
import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"

const CACHE_PREFIX = "agrimind-i18n-v4"
const LANG_KEY = "agrimind-language"

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en"
  const v = localStorage.getItem(LANG_KEY)
  if (v && isSupportedLanguage(v)) return v
  return "en"
}

export function setStoredLanguage(lang: SupportedLanguage) {
  localStorage.setItem(LANG_KEY, lang)
}

export function getCachedTranslations(
  lang: SupportedLanguage
): Partial<Record<UiCatalogKey, string>> | null {
  if (lang === "en" || typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}-catalog-${lang}`)
    if (!raw) return null
    return JSON.parse(raw) as Partial<Record<UiCatalogKey, string>>
  } catch {
    return null
  }
}

export function setCachedTranslations(
  lang: SupportedLanguage,
  map: Record<string, string>
) {
  if (lang === "en") return
  localStorage.setItem(`${CACHE_PREFIX}-catalog-${lang}`, JSON.stringify(map))
}

/** Persistent page string cache (survives refresh — avoids repeat API calls). */
export function getPageTranslationCache(
  lang: SupportedLanguage
): Record<string, string> | null {
  if (lang === "en" || typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}-page-${lang}`)
    if (!raw) return null
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return null
  }
}

export function setPageTranslationCache(
  lang: SupportedLanguage,
  map: Record<string, string>
) {
  if (lang === "en") return
  try {
    localStorage.setItem(`${CACHE_PREFIX}-page-${lang}`, JSON.stringify(map))
  } catch {
    /* quota exceeded — ignore */
  }
}
