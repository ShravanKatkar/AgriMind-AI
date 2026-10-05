"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  MapPin,
  Loader2,
  Sprout,
  Sun,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { INDIAN_LOCATIONS } from "@/lib/weather/cities"
import { useWeather } from "@/hooks/use-weather"
import { WeatherHeroCard } from "@/components/weather/weather-hero-card"
import { TypingText } from "@/components/ui/typing-text"
import { getSriLankaHour, getWeatherTimePeriod } from "@/lib/weather/time-theme"

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { delay: 0.05 * i, duration: 0.4, ease: "easeOut" as const },
})

function formatUpdated(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  return d.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  })
}

export default function WeatherPage() {
  const [locationId, setLocationId] = useState("pune")
  const { weather, loading, refreshing, refresh } = useWeather(locationId)

  const current = (weather?.current as Record<string, unknown>) ?? {}
  const forecast = (weather?.forecast as Record<string, unknown>[]) ?? []
  const alerts = (weather?.alerts as { type: string; message: string }[]) ?? []
  const tips = (weather?.farmingTips as string[]) ?? []
  const analysis = weather?.analysis as
    | { summary?: string; risks?: string[]; recommendations?: string[] }
    | null
    | undefined
  const location = weather?.location as { name?: string } | undefined
  const lastUpdated = String(weather?.lastUpdated ?? "")

  const period = getWeatherTimePeriod({
    isDaytime: current.isDaytime as boolean | undefined,
    condition: String(current.condition ?? ""),
    hour: getSriLankaHour(),
  })

  const insightPhrases = useMemo(() => {
    const temp = Number(current.temperature ?? 0)
    const humidity = Number(current.humidity ?? 0)
    const rain = Number(current.precipitationChance ?? 0)
    const uv = Number(current.uvIndex ?? 0)
    const name = location?.name ?? "your area"
    const lines: string[] = []

    if (rain >= 60) lines.push("Heavy rain likely — postpone fertilizer application")
    else if (rain >= 30) lines.push("Showers possible — protect harvested produce")
    if (humidity >= 85) lines.push("Very humid — scout for fungal leaf diseases")
    else if (humidity >= 70) lines.push("High humidity — improve airflow in nurseries")
    if (temp >= 34) lines.push("Extreme heat — irrigate crops at dawn or dusk")
    else if (temp >= 30) lines.push("Warm day — mulch soil to retain moisture")
    if (uv >= 8 && period !== "night") lines.push("Strong UV — shade young seedlings midday")
    if (period === "night") lines.push("Calm night — good time to plan tomorrow's field work")
    else if (period === "morning") lines.push("Morning conditions — ideal for spraying if dry")
    lines.push(`AgriMind watching weather for ${name}…`)

    return lines.slice(0, 5)
  }, [current, location?.name, period])

  const statItems = [
    {
      icon: Droplets,
      label: `${Number(current.humidity ?? 0)}% humidity`,
    },
    {
      icon: Wind,
      label: `${Number(current.windSpeed ?? 0)} km/h`,
    },
    {
      icon: CloudRain,
      label: `${Number(current.precipitationChance ?? 0)}% rain`,
    },
    {
      icon: Sun,
      label: `UV ${Number(current.uvIndex ?? 0)}`,
    },
  ]

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[40vh] gap-2 text-muted-foreground"
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        Loading weather…
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weather</h1>
          <p className="text-muted-foreground">
            Weather forecast and AI farming tips for your area.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-wrap items-center gap-2"
        >
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="w-[200px]">
              <MapPin className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}, {loc.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading || refreshing}
            onClick={() => void refresh()}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!weather ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground"
          >
            Unable to load weather right now. Please try again in a moment.
          </motion.p>
        ) : (
          <motion.div
            key={locationId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div
              {...stagger(1)}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              Updated {formatUpdated(lastUpdated)} ·{" "}
              <span className="capitalize">{period} scene</span>
              · Auto-refresh every 15 min
            </motion.div>

            <motion.div {...stagger(2)}>
              <WeatherHeroCard
                locationName={location?.name ?? locationId}
                temperature={Math.round(Number(current.temperature ?? 0))}
                condition={String(current.condition ?? "")}
                feelsLike={Math.round(Number(current.feelsLike ?? 0))}
                windDirection={
                  current.windDirection
                    ? String(current.windDirection)
                    : undefined
                }
                iconUrl={
                  current.iconUrl ? String(current.iconUrl) : undefined
                }
                isDaytime={current.isDaytime as boolean | undefined}
                statItems={statItems}
                insightPhrases={insightPhrases}
              />
            </motion.div>

            {analysis?.summary && (
              <motion.div {...stagger(3)}>
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 4,
                        }}
                      >
                        <Sparkles className="h-5 w-5 text-primary" />
                      </motion.div>
                      AI Weather Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground min-h-[3rem] leading-relaxed">
                      <TypingText
                        key={`${locationId}-${analysis.summary}`}
                        text={analysis.summary}
                        speedMs={28}
                        startDelayMs={400}
                      />
                    </p>
                    {analysis.risks && analysis.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Risks
                        </p>
                        <ul className="space-y-1">
                          {analysis.risks.map((r, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.45 + i * 0.06 }}
                              className="text-sm flex gap-2"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                              {r}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {alerts.length > 0 && (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {alerts.map((a, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Card className="border-accent/50">
                      <CardContent className="p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
                        <p className="text-sm">{a.message}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div {...stagger(4)}>
              <Card>
                <CardHeader>
                  <CardTitle>7-day forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.06, delayChildren: 0.2 },
                      },
                    }}
                  >
                    {forecast.map((day, i) => (
                      <motion.div
                        key={String(day.date)}
                        variants={{
                          hidden: { opacity: 0, y: 14, scale: 0.96 },
                          visible: { opacity: 1, y: 0, scale: 1 },
                        }}
                        whileHover={{
                          y: -4,
                          transition: { duration: 0.2 },
                        }}
                        className="rounded-lg border border-border p-3 text-center bg-card"
                      >
                        <p className="text-xs font-medium">{String(day.dayName)}</p>
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                          }}
                        >
                          <CloudRain className="h-6 w-6 mx-auto my-2 text-muted-foreground" />
                        </motion.div>
                        <p className="text-sm font-semibold">
                          {String(day.high)}° / {String(day.low)}°
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {String(day.rainChance)}% rain
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {tips.length > 0 && (
              <motion.div {...stagger(5)}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5" />
                      Farming recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tips.map((tip, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.07 }}
                        className="text-sm text-muted-foreground"
                      >
                        • {tip}
                      </motion.p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {refreshing && weather && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm shadow-lg"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating weather…
        </motion.div>
      )}
    </motion.div>
  )
}
