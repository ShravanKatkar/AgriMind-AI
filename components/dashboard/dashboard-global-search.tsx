"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
  Sprout,
  Camera,
  Mic,
  LineChart,
  ShoppingBag,
  CloudSun,
  Bell,
  Settings,
  User,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover"
import { useLanguage } from "@/contexts/language-context"
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder"
import {
  filterGlobalSearch,
  GLOBAL_SEARCH_ENTRIES,
} from "@/lib/dashboard/global-search-index"
import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"
import { cn } from "@/lib/utils"

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  crops: Sprout,
  diagnosis: Camera,
  history: FileText,
  voice: Mic,
  market: LineChart,
  sell: ShoppingBag,
  weather: CloudSun,
  chat: MessageSquare,
  reminders: Bell,
  settings: Settings,
  profile: User,
}

const TYPING_PHRASE_KEYS: UiCatalogKey[] = [
  "header.search",
  "search.phrase.disease",
  "search.phrase.voice",
  "search.phrase.market",
  "search.phrase.sell",
]

type DashboardGlobalSearchProps = {
  className?: string
  variant?: "desktop" | "mobile"
}

export function DashboardGlobalSearch({
  className,
  variant = "desktop",
}: DashboardGlobalSearchProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  const typingPhrases = useMemo(
    () => TYPING_PHRASE_KEYS.map((key) => t(key)),
    [t]
  )
  const animatedHint = useTypingPlaceholder(typingPhrases)
  const placeholder = focused || query ? t("header.search") : animatedHint || t("header.search")

  const results = useMemo(
    () => filterGlobalSearch(query, GLOBAL_SEARCH_ENTRIES, t),
    [query, t]
  )

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery("")
      setFocused(false)
      inputRef.current?.blur()
      router.push(href)
    },
    [router]
  )

  const askAi = useCallback(() => {
    const q = query.trim()
    if (!q) return
    navigate(`/dashboard/chat?prompt=${encodeURIComponent(q)}`)
  }, [navigate, query])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const showResults = open && (query.trim().length > 0 || focused)

  return (
    <Popover open={showResults} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative w-full", className)} data-no-translate>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showResults}
            aria-label={t("header.search")}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              setFocused(true)
              setOpen(true)
            }}
            onBlur={() => {
              window.setTimeout(() => {
                setFocused(false)
                setOpen(false)
              }, 180)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault()
                if (results[0]) {
                  navigate(results[0].href)
                } else {
                  askAi()
                }
              }
              if (e.key === "Escape") {
                setOpen(false)
                inputRef.current?.blur()
              }
            }}
            className={cn(
              "h-10 w-full border-0 bg-muted/60 pl-9 transition-colors focus-visible:bg-background focus-visible:ring-primary/30",
              variant === "desktop" ? "pr-16" : "pr-3",
              variant === "mobile" && "h-11 text-base"
            )}
          />
          {variant === "desktop" && (
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              Ctrl+K
            </kbd>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="rounded-lg border-0 shadow-none">
          <CommandList>
            {results.length === 0 && query.trim() ? (
              <CommandEmpty>{t("search.noResults")}</CommandEmpty>
            ) : null}

            {!query.trim() && (
              <CommandGroup heading={t("search.pages")}>
                {GLOBAL_SEARCH_ENTRIES.slice(0, 8).map((entry) => {
                  const Icon = NAV_ICONS[entry.icon] ?? LayoutDashboard
                  return (
                    <CommandItem
                      key={`default-${entry.id}`}
                      value={entry.id}
                      onSelect={() => navigate(entry.href)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{t(entry.titleKey)}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {query.trim() && results.length > 0 && (
              <CommandGroup heading={t("search.pages")}>
                {results.map((entry) => {
                  const Icon = NAV_ICONS[entry.icon] ?? LayoutDashboard
                  return (
                    <CommandItem
                      key={entry.id}
                      value={entry.id}
                      onSelect={() => navigate(entry.href)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{t(entry.titleKey)}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {query.trim() && (
              <CommandGroup heading={t("search.ai")}>
                <CommandItem onSelect={askAi} className="gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">
                    {t("search.askAi")}: &ldquo;{query.trim()}&rdquo;
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
