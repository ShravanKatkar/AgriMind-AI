export type WeatherTimePeriod = "morning" | "day" | "evening" | "night"

export interface WeatherTimeTheme {
  period: WeatherTimePeriod
  label: string
  image: string
  overlay: string
  textClass: string
  statPillClass: string
  glowColor: string
}

/** Sri Lanka local hour (Asia/Colombo) */
export function getSriLankaHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date)
  return Number(parts.find((p) => p.type === "hour")?.value ?? 12)
}

function isRainyCondition(condition?: string): boolean {
  if (!condition) return false
  const c = condition.toLowerCase()
  return (
    c.includes("rain") ||
    c.includes("shower") ||
    c.includes("drizzle") ||
    c.includes("storm") ||
    c.includes("thunder")
  )
}

export function getWeatherTimePeriod(
  options: {
    isDaytime?: boolean
    condition?: string
    hour?: number
  } = {}
): WeatherTimePeriod {
  const hour = options.hour ?? getSriLankaHour()

  if (options.isDaytime === false) return "night"
  if (options.isDaytime === true && hour >= 11 && hour < 17) return "day"

  if (hour >= 5 && hour < 11) return "morning"
  if (hour >= 11 && hour < 17) return "day"
  if (hour >= 17 && hour < 20) return "evening"
  return "night"
}

const THEMES: Record<WeatherTimePeriod, WeatherTimeTheme> = {
  morning: {
    period: "morning",
    label: "Morning",
    image: "/weather/morning.svg",
    overlay:
      "linear-gradient(135deg, rgba(255,183,77,0.75) 0%, rgba(255,224,178,0.55) 40%, rgba(129,199,132,0.45) 100%)",
    textClass: "text-foreground",
    statPillClass: "bg-white/55 backdrop-blur-md border border-white/40",
    glowColor: "rgba(255, 193, 7, 0.35)",
  },
  day: {
    period: "day",
    label: "Daytime",
    image: "/weather/day.svg",
    overlay:
      "linear-gradient(135deg, rgba(129,199,132,0.5) 0%, rgba(187,222,251,0.45) 50%, rgba(255,255,255,0.35) 100%)",
    textClass: "text-foreground",
    statPillClass: "bg-white/50 backdrop-blur-md border border-white/35",
    glowColor: "rgba(76, 175, 80, 0.3)",
  },
  evening: {
    period: "evening",
    label: "Evening",
    image: "/weather/evening.svg",
    overlay:
      "linear-gradient(135deg, rgba(255,112,67,0.65) 0%, rgba(171,71,188,0.45) 50%, rgba(63,81,181,0.4) 100%)",
    textClass: "text-foreground",
    statPillClass: "bg-white/45 backdrop-blur-md border border-white/30",
    glowColor: "rgba(255, 87, 34, 0.35)",
  },
  night: {
    period: "night",
    label: "Night",
    image: "/weather/night.svg",
    overlay:
      "linear-gradient(135deg, rgba(13,27,62,0.82) 0%, rgba(26,35,126,0.65) 50%, rgba(49,27,146,0.5) 100%)",
    textClass: "text-white",
    statPillClass: "bg-white/15 backdrop-blur-md border border-white/20 text-white",
    glowColor: "rgba(100, 181, 246, 0.25)",
  },
}

export function getWeatherTimeTheme(options: {
  isDaytime?: boolean
  condition?: string
  hour?: number
}): WeatherTimeTheme & { rainy: boolean } {
  const period = getWeatherTimePeriod(options)
  const rainy = isRainyCondition(options.condition)
  return { ...THEMES[period], rainy }
}
