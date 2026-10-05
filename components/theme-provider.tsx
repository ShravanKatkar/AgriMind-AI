"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  /** @default "theme" */
  storageKey?: string
  /** @default "system" */
  defaultTheme?: Theme
  /** Kept for API compatibility with next-themes */
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeContextValue = {
  theme: Theme | undefined
  setTheme: (theme: Theme) => void
  resolvedTheme: Theme | undefined
  systemTheme: Theme | undefined
  themes: Theme[]
  forcedTheme?: Theme
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: undefined,
  setTheme: () => {},
  resolvedTheme: undefined,
  systemTheme: undefined,
  themes: ["light", "dark", "system"],
})

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

function applyTheme(resolved: "light" | "dark", disableTransition: boolean) {
  const root = document.documentElement
  let cleanup: (() => void) | undefined

  if (disableTransition) {
    const style = document.createElement("style")
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}"
      )
    )
    document.head.appendChild(style)
    cleanup = () => {
      window.getComputedStyle(document.body)
      setTimeout(() => style.remove(), 0)
    }
  }

  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  root.style.colorScheme = resolved

  cleanup?.()
}

export function ThemeProvider({
  children,
  storageKey = "theme",
  defaultTheme = "system",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme | undefined>(undefined)
  const [resolvedTheme, setResolvedTheme] = React.useState<
    "light" | "dark" | undefined
  >(undefined)
  const [systemTheme, setSystemTheme] = React.useState<
    "light" | "dark" | undefined
  >(undefined)

  const apply = React.useCallback(
    (next: Theme) => {
      const resolved = resolveTheme(next)
      setResolvedTheme(resolved)
      setSystemTheme(getSystemTheme())
      applyTheme(resolved, disableTransitionOnChange)
    },
    [disableTransitionOnChange]
  )

  React.useEffect(() => {
    let stored: Theme = defaultTheme
    try {
      const value = localStorage.getItem(storageKey) as Theme | null
      if (value === "light" || value === "dark" || value === "system") {
        stored = value
      }
    } catch {
      /* private mode */
    }
    setThemeState(stored)
    apply(stored)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => {
      setSystemTheme(getSystemTheme())
      setThemeState((current) => {
        if (current === "system") {
          apply("system")
        }
        return current
      })
    }
    mq.addEventListener("change", onSystemChange)

    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return
      const next =
        e.newValue === "light" || e.newValue === "dark" || e.newValue === "system"
          ? e.newValue
          : defaultTheme
      setThemeState(next)
      apply(next)
    }
    window.addEventListener("storage", onStorage)

    return () => {
      mq.removeEventListener("change", onSystemChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [apply, defaultTheme, storageKey])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* private mode */
      }
      apply(next)
    },
    [apply, storageKey]
  )

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: ["light", "dark", "system"],
    }),
    [theme, setTheme, resolvedTheme, systemTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
