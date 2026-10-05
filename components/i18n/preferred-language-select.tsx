"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getLanguageDisplayLabel,
  getLanguagesByRegion,
  isSupportedLanguage,
} from "@/lib/i18n/languages"
import { LanguageMenuHeader } from "@/components/i18n/language-menu-header"
import { TRANSLATION_SERVICE_COPY } from "@/lib/i18n/translation-services"
import type { SupportedLanguage } from "@/types"

const languageGroups = getLanguagesByRegion()

type PreferredLanguageSelectProps = {
  value: SupportedLanguage
  onChange: (code: SupportedLanguage) => void
  disabled?: boolean
}

export function PreferredLanguageSelect({
  value,
  onChange,
  disabled,
}: PreferredLanguageSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (isSupportedLanguage(v)) onChange(v)
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" data-no-translate>
        <SelectValue placeholder="Choose language">
          {getLanguageDisplayLabel(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="max-h-[min(70vh,380px)]"
        data-no-translate
      >
        <LanguageMenuHeader
          title={TRANSLATION_SERVICE_COPY.appLanguageTitle}
          subtitle={TRANSLATION_SERVICE_COPY.profileLanguageSubtitle}
        />
        {languageGroups.map((group) => (
          <SelectGroup key={group.region}>
            <SelectLabel className="text-xs text-muted-foreground">
              {group.label}
            </SelectLabel>
            {group.languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{lang.nativeLabel}</span>
                  {lang.nativeLabel !== lang.label && (
                    <span className="text-xs text-muted-foreground">
                      {lang.label}
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
