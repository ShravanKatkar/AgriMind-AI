import fs from "node:fs"
import path from "node:path"
import type { jsPDF } from "jspdf"
import type { SupportedLanguage } from "@/types"

type FontSpec = {
  vfsName: string
  family: string
  file: string
}

const FONT_BY_LANG: Partial<Record<SupportedLanguage, FontSpec>> = {
  hi: {
    vfsName: "NotoSansDevanagari-Regular.ttf",
    family: "NotoDevanagari",
    file: "NotoSansDevanagari-Regular.ttf",
  },
  mr: {
    vfsName: "NotoSansDevanagari-Regular.ttf",
    family: "NotoDevanagari",
    file: "NotoSansDevanagari-Regular.ttf",
  },
}

const fontBase64Cache = new Map<string, string>()
const registeredOnDoc = new WeakMap<jsPDF, Set<string>>()

function loadFontBase64(fileName: string): string | null {
  if (fontBase64Cache.has(fileName)) {
    return fontBase64Cache.get(fileName)!
  }
  const fontPath = path.join(process.cwd(), "public", "fonts", fileName)
  if (!fs.existsSync(fontPath)) {
    console.warn(`[pdf] Missing font file: ${fontPath}`)
    return null
  }
  const base64 = fs.readFileSync(fontPath).toString("base64")
  fontBase64Cache.set(fileName, base64)
  return base64
}

export function usesUnicodePdfFont(language: SupportedLanguage): boolean {
  return Boolean(FONT_BY_LANG[language])
}

/**
 * Register and select the correct font for the report language.
 * Noto fonts only have "normal" — never fall back to Helvetica for hi/mr
 * (Helvetica turns Devanagari Hindi/Marathi labels into unreadable symbols).
 */
export function ensurePdfFont(doc: jsPDF, language: SupportedLanguage): string {
  const spec = FONT_BY_LANG[language]
  if (!spec) {
    doc.setFont("helvetica", "normal")
    return "helvetica"
  }

  const base64 = loadFontBase64(spec.file)
  if (!base64) {
    console.warn(`[pdf] Font missing for ${language}, using English labels recommended`)
    doc.setFont("helvetica", "normal")
    return "helvetica"
  }

  let registered = registeredOnDoc.get(doc)
  if (!registered) {
    registered = new Set()
    registeredOnDoc.set(doc, registered)
  }

  if (!registered.has(spec.family)) {
    doc.addFileToVFS(spec.vfsName, base64)
    doc.addFont(spec.vfsName, spec.family, "normal")
    registered.add(spec.family)
  }

  doc.setFont(spec.family, "normal")
  return spec.family
}

/** @deprecated use ensurePdfFont */
export function applyPdfFont(doc: jsPDF, language: SupportedLanguage): void {
  ensurePdfFont(doc, language)
}
