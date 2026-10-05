import type { SupportedLanguage } from "@/lib/i18n/languages"
import { UI_CATALOG, type UiCatalogKey } from "@/lib/i18n/ui-catalog"
import { getLandingStaticTranslation } from "@/lib/i18n/landing-static"
import { getStaticUiTranslations } from "@/lib/i18n/static-ui"

const englishByCatalogKey = new Map<string, string>(
  Object.entries(UI_CATALOG).map(([key, value]) => [value, key])
)

/** Reverse lookup: English UI string → translated label from bundled catalog. */
export function getCatalogTranslationByEnglish(
  lang: SupportedLanguage,
  english: string
): string | null {
  const trimmed = english.trim()
  if (!trimmed) return null
  const catalogKey = englishByCatalogKey.get(trimmed) as UiCatalogKey | undefined
  if (!catalogKey) return null
  const staticMap = getStaticUiTranslations(lang)
  return staticMap?.[catalogKey] ?? null
}

/** Resolve one string without calling Valsea/OpenAI. */
export function resolveStaticText(
  lang: SupportedLanguage,
  english: string
): string | null {
  if (lang === "en") return null
  return (
    getLandingStaticTranslation(lang, english) ??
    getCatalogTranslationByEnglish(lang, english)
  )
}

export function resolveStaticTexts(
  lang: SupportedLanguage,
  texts: string[]
): { resolved: string[]; missingIndices: number[] } {
  const resolved = [...texts]
  const missingIndices: number[] = []
  texts.forEach((text, index) => {
    const hit = resolveStaticText(lang, text)
    if (hit) {
      resolved[index] = hit
    } else {
      missingIndices.push(index)
    }
  })
  return { resolved, missingIndices }
}
