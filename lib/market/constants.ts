/** Re-fetch AI price estimates when data is older than this (ms) */
export const MARKET_PRICE_STALE_MS = 60 * 60 * 1000 // 1 hour

/** Client auto-refresh interval while Market page is open (ms) */
export const MARKET_AUTO_REFRESH_MS = 30 * 60 * 1000 // 30 minutes

export const MARKET_PRICE_SOURCE = {
  seed: "seed",
  ai: "ai_estimate",
} as const
