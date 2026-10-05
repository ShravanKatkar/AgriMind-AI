import {
  SHELL_BOTTOM_NAV_ITEMS,
  SHELL_NAV_ITEMS,
  type UiCatalogKey,
} from "@/lib/i18n/ui-catalog"

export type GlobalSearchEntry = {
  id: string
  titleKey: UiCatalogKey
  href: string
  icon: string
  keywords: string[]
}

const KEYWORD_TAGS: Record<string, string[]> = {
  dashboard: ["home", "overview", "stats", "main"],
  crops: ["crop", "field", "farm", "plant", "rice", "tomato", "harvest"],
  diagnosis: [
    "disease",
    "photo",
    "camera",
    "leaf",
    "pest",
    "fungus",
    "yellow",
    "treatment",
    "AI",
  ],
  history: ["report", "past", "pdf", "diagnosis history"],
  voice: ["speak", "microphone", "mic", "talk", "hindi", "marathi", "audio"],
  market: ["price", "wholesale", "buy", "demand", "colombo"],
  sell: ["sell", "sale", "buyer", "listing", "harvest", "product", "trade"],
  weather: ["rain", "forecast", "temperature", "climate", "monsoon"],
  chat: ["ask", "question", "AI", "help", "advice", "fertilizer"],
  reminders: ["alert", "notify", "schedule", "task", "treatment"],
  settings: ["account", "language", "preferences", "password"],
  profile: ["farmer", "name", "district", "phone"],
}

export const GLOBAL_SEARCH_ENTRIES: GlobalSearchEntry[] = [
  ...SHELL_NAV_ITEMS,
  ...SHELL_BOTTOM_NAV_ITEMS,
].map((item) => ({
  id: item.href,
  titleKey: item.key,
  href: item.href,
  icon: item.icon,
  keywords: KEYWORD_TAGS[item.icon] ?? [],
}))

export function filterGlobalSearch(
  query: string,
  entries: GlobalSearchEntry[],
  labelFor: (key: UiCatalogKey) => string
): GlobalSearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries.slice(0, 10)

  return entries
    .map((entry) => {
      const title = labelFor(entry.titleKey).toLowerCase()
      let score = 0
      if (title === q) score += 100
      else if (title.startsWith(q)) score += 50
      else if (title.includes(q)) score += 30
      if (entry.keywords.some((k) => k.includes(q) || q.includes(k))) score += 20
      if (entry.href.toLowerCase().includes(q)) score += 10
      return { entry, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.entry)
}
