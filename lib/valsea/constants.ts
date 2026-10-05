import { toValseaLanguageName } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/lib/i18n/languages"

/** @deprecated Use toValseaLanguageName from lib/i18n/languages */
export const VALSEA_LANGUAGE_MAP: Record<string, string> = {}

export function mapCodeToValsea(code: SupportedLanguage | string): string {
  return toValseaLanguageName(code)
}

export const VALSEA_MODELS = {
  transcribe: "valsea-transcribe",
  translate: "valsea-translate",
} as const
