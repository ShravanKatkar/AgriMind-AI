"use client"

import { Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import { LanguageMenuHeader } from "@/components/i18n/language-menu-header"
import { cn } from "@/lib/utils"
import type { SupportedLanguage } from "@/types"

type LanguagePickerProps = {
  variant?: "ghost" | "outline"
  size?: "sm" | "default"
  className?: string
  /** Applied to the dropdown panel (e.g. z-[110] inside mobile nav overlays). */
  contentClassName?: string
}

export function LanguagePicker({
  variant = "ghost",
  size = "sm",
  className,
  contentClassName,
}: LanguagePickerProps) {
  const { language, setLanguage, isTranslating, languageGroups } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          disabled={isTranslating}
          data-no-translate
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline max-w-[140px] truncate">
            {getLanguageDisplayLabel(language)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-56 p-0", contentClassName)}
        data-no-translate
      >
        <LanguageMenuHeader />
        <ScrollArea className="h-[min(70vh,420px)]">
          <div className="p-1">
            {languageGroups.map((group, gi) => (
              <div key={group.region}>
                {gi > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>
                {group.languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    className={cn(
                      language === lang.code && "bg-accent font-medium"
                    )}
                    onClick={() =>
                      void setLanguage(lang.code as SupportedLanguage)
                    }
                  >
                    <span className="truncate">{lang.nativeLabel}</span>
                    {lang.nativeLabel !== lang.label && (
                      <span className="ml-auto text-xs text-muted-foreground truncate max-w-[90px]">
                        {lang.label}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
