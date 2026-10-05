import {
  assertGoogleWeatherConfigured,
  googleWeatherConfig,
} from "@/lib/weather/config"

type TempValue = { degrees?: number; unit?: string }
type WindSpeed = { value?: number; unit?: string }

export interface GoogleCurrentConditions {
  currentTime?: string
  isDaytime?: boolean
  weatherCondition?: {
    description?: { text?: string }
    type?: string
    iconBaseUri?: string
  }
  temperature?: TempValue
  feelsLikeTemperature?: TempValue
  relativeHumidity?: number
  uvIndex?: number
  precipitation?: {
    probability?: { percent?: number; type?: string }
  }
  thunderstormProbability?: number
  wind?: {
    speed?: WindSpeed
    gust?: WindSpeed
    direction?: { cardinal?: string }
  }
  visibility?: { distance?: number; unit?: string }
  cloudCover?: number
}

export interface GoogleForecastDay {
  displayDate?: { year?: number; month?: number; day?: number }
  maxTemperature?: TempValue
  minTemperature?: TempValue
  daytimeForecast?: {
    weatherCondition?: { description?: { text?: string } }
    precipitation?: { probability?: { percent?: number } }
    thunderstormProbability?: number
  }
  nighttimeForecast?: {
    precipitation?: { probability?: { percent?: number } }
  }
}

export interface GoogleForecastDaysResponse {
  forecastDays?: GoogleForecastDay[]
  timeZone?: { id?: string }
}

function buildLocationParams(lat: number, lng: number) {
  return new URLSearchParams({
    key: assertGoogleWeatherConfigured(),
    "location.latitude": String(lat),
    "location.longitude": String(lng),
    unitsSystem: "METRIC",
  })
}

async function googleWeatherGet<T>(path: string, params: URLSearchParams): Promise<T> {
  const url = `${googleWeatherConfig.baseUrl}${path}?${params}`
  const res = await fetch(url, { cache: "no-store" })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = data as { error?: { message?: string } }
    throw new Error(
      err.error?.message ?? `Google Weather API error (${res.status})`
    )
  }

  return data as T
}

/** Real-time conditions — https://developers.google.com/maps/documentation/weather/current-conditions */
export async function lookupCurrentConditions(
  latitude: number,
  longitude: number
): Promise<GoogleCurrentConditions> {
  const params = buildLocationParams(latitude, longitude)
  return googleWeatherGet<GoogleCurrentConditions>(
    "/currentConditions:lookup",
    params
  )
}

/** Daily forecast — https://developers.google.com/maps/documentation/weather/daily-forecast */
export async function lookupForecastDays(
  latitude: number,
  longitude: number,
  days = 7
): Promise<GoogleForecastDaysResponse> {
  const params = buildLocationParams(latitude, longitude)
  params.set("days", String(Math.min(10, Math.max(1, days))))
  params.set("pageSize", String(Math.min(10, days)))

  return googleWeatherGet<GoogleForecastDaysResponse>(
    "/forecast/days:lookup",
    params
  )
}
