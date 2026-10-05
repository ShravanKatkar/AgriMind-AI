import type { SupportedLanguage } from "@/lib/i18n/languages"
import { HI_UI } from "@/lib/i18n/bundled/hi-ui"
import { MR_UI } from "@/lib/i18n/bundled/mr-ui"
import {
  UI_CATALOG,
  UI_CATALOG_KEYS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"

type StaticMap = Partial<Record<UiCatalogKey, string>>

const STATIC_BY_LANG: Partial<Record<SupportedLanguage, StaticMap>> = {
  hi: HI_UI,
  mr: MR_UI,
}

export function getStaticUiTranslations(
  lang: SupportedLanguage
): TranslationMap | null {
  if (lang === "en") return null
  const partial = STATIC_BY_LANG[lang]
  if (!partial) return null
  return partial as TranslationMap
}

export function hasBuiltInShellTranslations(lang: SupportedLanguage): boolean {
  return lang === "hi" || lang === "mr"
}

export function isShellCatalogComplete(map: TranslationMap): boolean {
  return SHELL_CATALOG_KEYS.every((key) => Boolean(map[key]))
}

export type TranslationMap = Partial<Record<UiCatalogKey, string>>

export function mergeTranslations(
  lang: SupportedLanguage,
  ...layers: (TranslationMap | null | undefined)[]
): TranslationMap {
  if (lang === "en") return {}
  const merged: TranslationMap = {}
  for (const layer of layers) {
    if (!layer) continue
    for (const key of UI_CATALOG_KEYS) {
      if (layer[key]) merged[key] = layer[key]
    }
  }
  return merged
}

export function isCatalogComplete(map: TranslationMap): boolean {
  return UI_CATALOG_KEYS.every((key) => Boolean(map[key]))
}

/** Keys required for sidebar + header (instant UI) */
export const SHELL_CATALOG_KEYS: UiCatalogKey[] = [
  "app.name",
  "nav.dashboard",
  "nav.crops",
  "nav.diagnosis",
  "nav.diagnosisHistory",
  "nav.voice",
  "nav.market",
  "nav.weather",
  "nav.chat",
  "nav.reminders",
  "nav.settings",
  "nav.profile",
  "nav.signOut",
  "header.search",
  "search.pages",
  "search.noResults",
  "search.ai",
  "search.askAi",
  "search.phrase.disease",
  "search.phrase.voice",
  "search.phrase.market",
  "header.notifications",
]

export function getEnglishCatalogValues(keys: UiCatalogKey[] = UI_CATALOG_KEYS): string[] {
  return keys.map((k) => UI_CATALOG[k])
}
