import { getLocationById, type SriLankaLocation } from "@/lib/weather/cities"
import {
  isGoogleWeatherConfigured,
} from "@/lib/weather/config"
import {
  lookupCurrentConditions,
  lookupForecastDays,
} from "@/lib/weather/google-client"
import { generateWeatherFarmingAnalysis } from "@/services/weather-analysis.service"

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "clear" },
  1: { label: "Mainly clear", icon: "clear" },
  2: { label: "Partly cloudy", icon: "partly" },
  3: { label: "Overcast", icon: "cloudy" },
  45: { label: "Foggy", icon: "fog" },
  48: { label: "Depositing rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "rain" },
  61: { label: "Slight rain", icon: "rain" },
  63: { label: "Moderate rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  80: { label: "Rain showers", icon: "rain" },
  95: { label: "Thunderstorm", icon: "storm" },
}

export interface WeatherForecastDay {
  date: string
  dayName: string
  high: number
  low: number
  rainChance: number
  condition: string
}

export interface WeatherAnalysisBlock {
  summary: string
  risks: string[]
  recommendations: string[]
}

export interface WeatherData {
  location: SriLankaLocation
  source: "google" | "open-meteo"
  lastUpdated: string
  current: {
    temperature: number
    humidity: number
    windSpeed: number
    condition: string
    icon: string
    feelsLike: number
    uvIndex?: number
    precipitationChance?: number
    windDirection?: string
    cloudCover?: number
    isDaytime?: boolean
    iconUrl?: string
  }
  forecast: WeatherForecastDay[]
  alerts: { type: "warning" | "info"; message: string }[]
  farmingTips: string[]
  analysis?: WeatherAnalysisBlock | null
}

function mapGoogleIcon(type?: string): string {
  if (!type) return "partly"
  const t = type.toLowerCase()
  if (t.includes("clear") || t.includes("sunny")) return "clear"
  if (t.includes("rain") || t.includes("shower") || t.includes("drizzle"))
    return "rain"
  if (t.includes("thunder") || t.includes("storm")) return "storm"
  if (t.includes("fog") || t.includes("mist")) return "fog"
  if (t.includes("cloud")) return "partly"
  return "partly"
}

async function fetchGoogleWeather(location: SriLankaLocation): Promise<WeatherData> {
  const [current, forecastRes] = await Promise.all([
    lookupCurrentConditions(location.latitude, location.longitude),
    lookupForecastDays(location.latitude, location.longitude, 7),
  ])

  const condition =
    current.weatherCondition?.description?.text ?? "Current conditions"
  const windKmh = Math.round(current.wind?.speed?.value ?? 0)
  const precip = current.precipitation?.probability?.percent ?? 0
  const uv = current.uvIndex ?? 0

  const forecast: WeatherForecastDay[] = (forecastRes.forecastDays ?? [])
    .slice(0, 7)
    .map((day) => {
      const d = day.displayDate
      const date =
        d != null
          ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
          : new Date().toISOString().slice(0, 10)
      const dateObj = new Date(date)
      const dayRain = Math.max(
        day.daytimeForecast?.precipitation?.probability?.percent ?? 0,
        day.nighttimeForecast?.precipitation?.probability?.percent ?? 0
      )
      return {
        date,
        dayName: dateObj.toLocaleDateString("en", { weekday: "short" }),
        high: Math.round(day.maxTemperature?.degrees ?? 0),
        low: Math.round(day.minTemperature?.degrees ?? 0),
        rainChance: dayRain,
        condition:
          day.daytimeForecast?.weatherCondition?.description?.text ??
          condition,
      }
    })

  const alerts: WeatherData["alerts"] = []
  const maxRain = Math.max(...forecast.map((f) => f.rainChance), precip)
  if (maxRain >= 70) {
    alerts.push({
      type: "warning",
      message: `Heavy rain likely (${maxRain}% chance). Delay fertilizer and protect seedlings.`,
    })
  }
  if ((current.thunderstormProbability ?? 0) >= 30) {
    alerts.push({
      type: "warning",
      message: "Thunderstorm risk — avoid field work on open land and secure equipment.",
    })
  }
  if ((current.temperature?.degrees ?? 0) >= 34) {
    alerts.push({
      type: "warning",
      message: "High temperature — irrigate early morning or evening to reduce stress.",
    })
  }
  if (uv >= 8) {
    alerts.push({
      type: "info",
      message: "Very high UV — limit midday field work; protect young plants.",
    })
  }

  const base: WeatherData = {
    location,
    source: "google",
    lastUpdated: current.currentTime ?? new Date().toISOString(),
    current: {
      temperature: Math.round(current.temperature?.degrees ?? 0),
      humidity: Math.round(current.relativeHumidity ?? 0),
      windSpeed: windKmh,
      condition,
      icon: mapGoogleIcon(current.weatherCondition?.type),
      feelsLike: Math.round(current.feelsLikeTemperature?.degrees ?? 0),
      uvIndex: uv,
      precipitationChance: precip,
      windDirection: current.wind?.direction?.cardinal,
      cloudCover: current.cloudCover,
      isDaytime: current.isDaytime,
      iconUrl: current.weatherCondition?.iconBaseUri,
    },
    forecast,
    alerts,
    farmingTips: [],
  }

  const analysis = await generateWeatherFarmingAnalysis(base).catch(() => null)
  base.analysis = analysis
  base.farmingTips =
    analysis?.recommendations?.length
      ? analysis.recommendations
      : buildDefaultTips(maxRain, current.temperature?.degrees ?? 0)

  return base
}

function buildDefaultTips(maxRain: number, temp: number): string[] {
  const tips = [
    "Water crops early morning (5–7 AM) to reduce evaporation.",
    "Check drainage in paddy fields before expected rainfall.",
  ]
  if (maxRain >= 50) {
    tips.unshift("Delay fertilizer until after heavy rain passes.")
  }
  if (temp >= 32) {
    tips.push("Increase irrigation frequency during heat waves.")
  }
  return tips
}

async function fetchOpenMeteoWeather(location: SriLankaLocation): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Asia/Colombo",
    forecast_days: "7",
  })

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Weather service unavailable")
  }

  const data = await res.json()
  const current = data.current
  const daily = data.daily

  const code = current.weather_code as number
  const wmo = WMO_CODES[code] ?? { label: "Variable", icon: "partly" }

  const forecast: WeatherForecastDay[] = daily.time.map(
    (date: string, i: number) => {
      const d = new Date(date)
      const dayCode = daily.weather_code[i] as number
      const dayWmo = WMO_CODES[dayCode] ?? { label: "Variable", icon: "partly" }
      return {
        date,
        dayName: d.toLocaleDateString("en", { weekday: "short" }),
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
        rainChance: daily.precipitation_probability_max[i] ?? 0,
        condition: dayWmo.label,
      }
    }
  )

  const maxRain = Math.max(...forecast.map((f) => f.rainChance))
  const alerts: WeatherData["alerts"] = []
  if (maxRain >= 70) {
    alerts.push({
      type: "warning",
      message: `Heavy rain expected (${maxRain}% chance). Adjust irrigation and protect sensitive crops.`,
    })
  }
  if (current.temperature_2m >= 34) {
    alerts.push({
      type: "warning",
      message: "High temperature alert — ensure adequate watering early morning or evening.",
    })
  }

  return {
    location,
    source: "open-meteo",
    lastUpdated: new Date().toISOString(),
    current: {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      condition: wmo.label,
      icon: wmo.icon,
      feelsLike: Math.round(current.apparent_temperature),
    },
    forecast,
    alerts,
    farmingTips: buildDefaultTips(maxRain, current.temperature_2m),
    analysis: null,
  }
}

export async function fetchWeather(locationId: string): Promise<WeatherData> {
  const location = getLocationById(locationId)

  if (isGoogleWeatherConfigured()) {
    try {
      return await fetchGoogleWeather(location)
    } catch (err) {
      console.error("[weather] Google Weather failed, using Open-Meteo:", err)
    }
  }

  return fetchOpenMeteoWeather(location)
}
