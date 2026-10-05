import type { SupportedLanguage } from "@/lib/i18n/languages"
import { getLandingStaticTranslation } from "@/lib/i18n/landing-static"
import { resolveStaticText } from "@/lib/i18n/resolve-static"

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "SVG",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
])

const SKIP_SELECTOR =
  "[data-no-translate],[data-i18n-key],[data-slot='dropdown-menu'],[data-radix-popper-content-wrapper]"

function shouldSkipElement(el: Element | null): boolean {
  if (!el) return true
  if (SKIP_TAGS.has(el.tagName)) return true
  if (el.closest(SKIP_SELECTOR)) return true
  return false
}

export interface TextTarget {
  node: Text
  source: string
}

const textOrigins = new WeakMap<Text, string>()

/** Collect leaf text nodes for translation (works with nested spans, motion divs, mock UI). */
export function collectTextTargets(root: HTMLElement): TextTarget[] {
  const targets: TextTarget[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)

  let n: Node | null
  while ((n = walker.nextNode())) {
    const node = n as Text
    const parent = node.parentElement
    if (!parent || shouldSkipElement(parent)) continue

    const raw = node.textContent ?? ""
    const source = raw.trim()
    if (source.length < 2) continue
    if (/^[\d.,%+\-/]+$/.test(source)) continue

    if (!textOrigins.has(node)) {
      textOrigins.set(node, source)
    }

    targets.push({ node, source: textOrigins.get(node) ?? source })
  }

  return targets
}

export function collectPlaceholderTargets(
  root: HTMLElement
): { el: HTMLInputElement | HTMLTextAreaElement; source: string }[] {
  const items: { el: HTMLInputElement | HTMLTextAreaElement; source: string }[] = []
  root
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input[placeholder],textarea[placeholder]"
    )
    .forEach((el) => {
      if (shouldSkipElement(el)) return
      const source = el.dataset.i18nOrigPlaceholder ?? el.getAttribute("placeholder")?.trim()
      if (source) items.push({ el, source })
    })
  return items
}

export function applyTextTranslation(node: Text, translated: string) {
  const raw = node.textContent ?? ""
  const lead = raw.match(/^\s*/)?.[0] ?? ""
  const trail = raw.match(/\s*$/)?.[0] ?? ""
  node.textContent = `${lead}${translated}${trail}`
}

export function restoreEnglishPage(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n: Node | null
  while ((n = walker.nextNode())) {
    const node = n as Text
    const orig = textOrigins.get(node)
    if (orig) applyTextTranslation(node, orig)
  }

  root
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "input[data-i18n-orig-placeholder],textarea[data-i18n-orig-placeholder]"
    )
    .forEach((el) => {
      if (el.dataset.i18nOrigPlaceholder) {
        el.setAttribute("placeholder", el.dataset.i18nOrigPlaceholder)
      }
    })
}

export function resolveTranslations(
  lang: SupportedLanguage,
  sources: string[],
  apiTranslations: string[]
): Map<string, string> {
  const map = new Map<string, string>()
  sources.forEach((src, i) => {
    const builtIn =
      resolveStaticText(lang, src) ?? getLandingStaticTranslation(lang, src)
    const fromApi = apiTranslations[i]?.trim()
    map.set(src, builtIn ?? (fromApi && fromApi !== src ? fromApi : src))
  })
  return map
}
