/** Google Weather API — server-only (see https://developers.google.com/maps/documentation/weather) */
export const googleWeatherConfig = {
  apiKey: process.env.GOOGLE_WEATHER_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY,
  baseUrl: "https://weather.googleapis.com/v1",
}

export function assertGoogleWeatherConfigured(): string {
  const key = googleWeatherConfig.apiKey
  if (!key?.trim()) {
    throw new Error(
      "GOOGLE_WEATHER_API_KEY is not set. Enable Weather API in Google Cloud Console."
    )
  }
  return key.trim()
}

export function isGoogleWeatherConfigured(): boolean {
  return Boolean(googleWeatherConfig.apiKey?.trim())
}
