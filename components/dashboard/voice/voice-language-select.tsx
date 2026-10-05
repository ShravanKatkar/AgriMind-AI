"use client"

import { ChevronDown, Globe, Sparkles } from "lucide-react"
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
import {
  AUTO_DETECT_LANGUAGE,
  getLanguageDisplayLabel,
  getLanguagesByRegion,
  isAutoDetectLanguage,
  type VoiceLanguagePreference,
} from "@/lib/i18n/languages"
import { TRANSLATION_SERVICE_COPY } from "@/lib/i18n/translation-services"
import { cn } from "@/lib/utils"

type VoiceLanguageSelectProps = {
  value: VoiceLanguagePreference
  onChange: (code: VoiceLanguagePreference) => void
  detectedLanguage?: string | null
  disabled?: boolean
  className?: string
}

const languageGroups = getLanguagesByRegion()

function displayValue(
  value: VoiceLanguagePreference,
  detectedLanguage?: string | null
) {
  if (isAutoDetectLanguage(value)) {
    if (detectedLanguage) {
      return `Auto · ${getLanguageDisplayLabel(detectedLanguage)}`
    }
    return "Auto-detect language"
  }
  return getLanguageDisplayLabel(value)
}

export function VoiceLanguageSelect({
  value,
  onChange,
  detectedLanguage,
  disabled,
  className,
}: VoiceLanguageSelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 min-w-[180px] justify-between gap-2 border-primary/20 bg-background px-3 font-medium",
            className
          )}
          data-no-translate
        >
          <span className="flex items-center gap-2 truncate">
            {isAutoDetectLanguage(value) ? (
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Globe className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="truncate">
              {displayValue(value, detectedLanguage)}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-0"
        data-no-translate
      >
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs font-semibold text-foreground">
            {TRANSLATION_SERVICE_COPY.voiceTitle}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Recommended: Auto-detect — speak in your mother tongue
          </p>
        </div>
        <ScrollArea className="h-[min(70vh,380px)]">
          <div className="p-1">
            <DropdownMenuItem
              className={cn(
                "cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary",
                isAutoDetectLanguage(value) &&
                  "bg-primary/10 font-medium text-primary"
              )}
              onClick={() => onChange(AUTO_DETECT_LANGUAGE)}
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Auto-detect (recommended)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
                      "cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary",
                      value === lang.code &&
                        "bg-primary/10 font-medium text-primary"
                    )}
                    onClick={() => onChange(lang.code)}
                  >
                    <span className="truncate">{lang.nativeLabel}</span>
                    {lang.nativeLabel !== lang.label && (
                      <span className="ml-auto max-w-[100px] truncate text-xs text-muted-foreground">
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
