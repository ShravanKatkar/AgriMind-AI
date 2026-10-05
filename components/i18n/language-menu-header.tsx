import { TRANSLATION_SERVICE_COPY } from "@/lib/i18n/translation-services"

type LanguageMenuHeaderProps = {
  title?: string
  subtitle?: string
}

export function LanguageMenuHeader({
  title = TRANSLATION_SERVICE_COPY.appLanguageTitle,
  subtitle = TRANSLATION_SERVICE_COPY.appLanguageSubtitle,
}: LanguageMenuHeaderProps) {
  return (
    <div className="border-b border-border px-3 py-2">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
    </div>
  )
}
