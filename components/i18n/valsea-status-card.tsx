"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Mic, Globe, AlertCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FULL_UI_LANGUAGES, TRANSLATION_SERVICE_COPY } from "@/lib/i18n/translation-services"

type ValseaStatus = {
  configured: boolean
  baseUrl: string
  textTranslationProvider: string
  valseaReservedFor: string
  rateLimit: {
    maxPerMinute: number
    remaining: number
    inCooldown: boolean
    cooldownEndsInMs: number
  }
}

export function ValseaStatusCard() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ValseaStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/valsea/status")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        if (json.success) {
          setStatus(json.data as ValseaStatus)
          setError(null)
        } else {
          setError(json.error ?? "Could not load status")
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach translation service")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const voiceOk = Boolean(status?.configured && !status.rateLimit.inCooldown)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Translation & voice (VALSEA.ai)
        </CardTitle>
        <CardDescription>
          How AgriMind uses languages across the website — checked on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking services…
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <StatusPill
                ok={Boolean(status?.configured)}
                label={
                  status?.configured
                    ? "VALSEA voice API connected"
                    : "VALSEA API key missing"
                }
                hint={
                  status?.configured
                    ? "Voice Assistant & AI Chat microphone"
                    : "Add VALSEA_API_KEY to .env.local and restart"
                }
              />
              <StatusPill
                ok={voiceOk}
                label={
                  status?.rateLimit.inCooldown
                    ? "Voice rate limit (cooldown)"
                    : `Voice quota: ${status?.rateLimit.remaining ?? 0}/${status?.rateLimit.maxPerMinute ?? 18} per min`
                }
                hint="Shared server limit for all farmers on this instance"
              />
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Mic className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Voice input</strong> —{" "}
                  {TRANSLATION_SERVICE_COPY.voiceSubtitle}. Uses VALSEA.ai on the
                  server ({status?.baseUrl ?? "api.valsea.ai"}).
                </span>
              </li>
              <li className="flex gap-2">
                <Globe className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">App menus</strong> — Instant
                  for {FULL_UI_LANGUAGES.join(", ")}. Other languages keep English
                  menus.
                </span>
              </li>
              <li className="flex gap-2">
                <Globe className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Landing page</strong> — Instant
                  Hindi/Marathi from built-in strings; rest stays English.
                </span>
              </li>
              <li className="flex gap-2">
                <Globe className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Diagnosis PDF</strong> — Download
                  in your app language (Hindi/Marathi use native Devanagari font). Text
                  translated via {status?.textTranslationProvider ?? "openai"}.
                </span>
              </li>
            </ul>

            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Admin panel is English only. Change language from the header globe icon
              on dashboard and landing pages.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function StatusPill({
  ok,
  label,
  hint,
}: {
  ok: boolean
  label: string
  hint: string
}) {
  const Icon = ok ? CheckCircle2 : XCircle
  return (
    <div
      className={`flex min-w-[200px] flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2 text-sm ${
        ok
          ? "border-primary/25 bg-primary/5"
          : "border-destructive/30 bg-destructive/5"
      }`}
    >
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        <Icon
          className={`h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-destructive"}`}
        />
        {label}
      </span>
      <span className="text-xs text-muted-foreground pl-5">{hint}</span>
    </div>
  )
}
