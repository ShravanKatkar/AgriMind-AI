import { createHash } from "crypto"
import type { SupportedLanguage } from "@/lib/i18n/languages"

const MAX_ENTRIES = 4000
const cache = new Map<string, string>()

function cacheKey(lang: string, source: string, text: string): string {
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 24)
  return `${lang}:${source}:${hash}`
}

export function getCachedServerTranslation(
  target: SupportedLanguage,
  source: string,
  text: string
): string | undefined {
  return cache.get(cacheKey(target, source, text.trim()))
}

export function setCachedServerTranslation(
  target: SupportedLanguage,
  source: string,
  text: string,
  translated: string
): void {
  if (cache.size >= MAX_ENTRIES) {
    const first = cache.keys().next().value
    if (first) cache.delete(first)
  }
  cache.set(cacheKey(target, source, text.trim()), translated)
}
