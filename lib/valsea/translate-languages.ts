import type { SupportedLanguage } from "@/lib/i18n/languages"

/** Languages supported by POST /v1/translations (Valsea API, May 2026). */
export const VALSEA_TRANSLATE_TARGETS = [
  "english",
  "hindi",
  "marathi",
] as const

export type ValseaTranslateTarget = (typeof VALSEA_TRANSLATE_TARGETS)[number]

const CODE_TO_VALSEA_TARGET: Partial<Record<SupportedLanguage, ValseaTranslateTarget>> = {
  en: "english",
  hi: "hindi",
  mr: "marathi",
}

export function toValseaTranslateTarget(
  code: SupportedLanguage | string
): ValseaTranslateTarget | null {
  return CODE_TO_VALSEA_TARGET[code as SupportedLanguage] ?? null
}

export function isValseaTranslateSupported(
  code: SupportedLanguage | string
): boolean {
  return toValseaTranslateTarget(code) !== null
}

export function toValseaTranslateSource(
  code: SupportedLanguage | "auto"
): ValseaTranslateTarget | "auto" {
  if (code === "auto") return "auto"
  return toValseaTranslateTarget(code) ?? "english"
}
