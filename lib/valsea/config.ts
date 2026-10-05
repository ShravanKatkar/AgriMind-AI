/** Server-side VALSEA configuration (never expose key to the client). */

export function getValseaApiKey(): string | null {
  const raw = process.env.VALSEA_API_KEY?.trim()
  if (!raw) return null
  if (raw === "your-api-key" || raw === "paste-your-key") return null
  return raw
}

export function getValseaBaseUrl(): string {
  return (process.env.VALSEA_API_BASE_URL ?? "https://api.valsea.ai").replace(
    /\/$/,
    ""
  )
}

export function requireValseaApiKey(): string {
  const key = getValseaApiKey()
  if (!key) {
    throw new Error(
      "VALSEA_API_KEY is not set. Add it to .env.local and restart the dev server."
    )
  }
  return key
}

export function isValseaConfigured(): boolean {
  return getValseaApiKey() !== null
}
