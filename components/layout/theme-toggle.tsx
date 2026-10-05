"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

function useIsDark() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark =
    mounted &&
    (theme === "dark" || (theme === "system" && resolvedTheme === "dark"))

  const toggle = () => setTheme(isDark ? "light" : "dark")

  return { mounted, isDark, toggle, setTheme }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { mounted, isDark, toggle } = useIsDark()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} aria-hidden>
        <span className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

/** Full-width row for mobile menus — label + switch */
export function ThemeToggleRow({
  className,
  onToggle,
}: {
  className?: string
  onToggle?: () => void
}) {
  const { mounted, isDark, toggle, setTheme } = useIsDark()

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex h-12 items-center justify-between rounded-xl border border-border bg-muted/40 px-4",
          className
        )}
        aria-hidden
      />
    )
  }

  const handleChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
    onToggle?.()
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3",
        className
      )}
      data-no-translate
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Appearance</p>
          <p className="text-xs text-muted-foreground">
            {isDark ? "Dark mode" : "Light mode"}
          </p>
        </div>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={handleChange}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      />
    </div>
  )
}
