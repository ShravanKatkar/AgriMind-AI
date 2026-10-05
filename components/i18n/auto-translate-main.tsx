"use client"

import { useCallback, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import {
  getPageTranslationCache,
  setPageTranslationCache,
} from "@/lib/i18n/storage"
import { PAGE_DOM_USES_LIVE_API } from "@/lib/i18n/translation-policy"
import {
  applyTextTranslation,
  collectPlaceholderTargets,
  collectTextTargets,
  resolveTranslations,
  restoreEnglishPage,
} from "@/lib/i18n/page-translator-client"

export function AutoTranslateMain({ children }: { children: React.ReactNode }) {
  const { language, translateTexts, setPageTranslating } = useLanguage()
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)
  const runId = useRef(0)
  const cacheRef = useRef<Record<string, Record<string, string>>>({})
  const translatedOnceRef = useRef<string>("")

  const runTranslation = useCallback(async () => {
    const root = rootRef.current
    if (!root || language === "en") return

    const runKey = `${language}:${pathname}`
    if (!PAGE_DOM_USES_LIVE_API && translatedOnceRef.current === runKey) {
      return
    }

    const currentRun = ++runId.current
    setPageTranslating(true)

    try {
      const textTargets = collectTextTargets(root)
      const placeholderTargets = collectPlaceholderTargets(root)

      const sources: string[] = []
      for (const t of textTargets) {
        if (!sources.includes(t.source)) sources.push(t.source)
      }
      for (const p of placeholderTargets) {
        if (!sources.includes(p.source)) sources.push(p.source)
      }

      if (sources.length === 0) return

      const langCache =
        cacheRef.current[language] ??
        getPageTranslationCache(language) ??
        {}

      const missing = sources.filter((s) => !langCache[s])

      if (missing.length > 0) {
        const staticResults = await translateTexts(missing)
        if (currentRun !== runId.current) return

        const resolved = resolveTranslations(language, missing, staticResults)
        resolved.forEach((value, key) => {
          langCache[key] = value
        })
        cacheRef.current[language] = langCache
        setPageTranslationCache(language, langCache)
      }

      if (currentRun !== runId.current) return

      for (const { node, source } of textTargets) {
        const translated = langCache[source]
        if (translated && translated !== source) {
          applyTextTranslation(node, translated)
        }
      }

      for (const { el, source } of placeholderTargets) {
        const translated = langCache[source]
        if (translated && translated !== source) {
          el.setAttribute("placeholder", translated)
        }
      }

      translatedOnceRef.current = runKey
    } finally {
      if (currentRun === runId.current) {
        setPageTranslating(false)
      }
    }
  }, [language, pathname, translateTexts, setPageTranslating])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (language === "en") {
      restoreEnglishPage(root)
      translatedOnceRef.current = ""
      return
    }

    const timer = window.setTimeout(() => {
      void runTranslation()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [language, pathname, runTranslation])

  return (
    <div ref={rootRef} className="min-h-0" data-translate-root>
      {children}
    </div>
  )
}
