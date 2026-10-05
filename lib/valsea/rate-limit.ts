/**
 * In-memory guard for Valsea API (transcribe / voice).
 * Text translation uses OpenAI — not counted here.
 */

const WINDOW_MS = 60_000

function maxRequestsPerMinute(): number {
  const raw = process.env.VALSEA_MAX_REQUESTS_PER_MINUTE?.trim()
  const n = raw ? Number.parseInt(raw, 10) : 18
  return Number.isFinite(n) && n > 0 ? Math.min(n, 60) : 18
}

const timestamps: number[] = []
let cooldownUntil = 0

function prune(now: number) {
  while (timestamps.length > 0 && now - timestamps[0]! >= WINDOW_MS) {
    timestamps.shift()
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number; reason: string }

export function checkValseaRateLimit(): RateLimitResult {
  const now = Date.now()
  if (now < cooldownUntil) {
    return {
      allowed: false,
      retryAfterMs: cooldownUntil - now,
      reason: "Valsea rate limit cooldown active",
    }
  }

  prune(now)
  const max = maxRequestsPerMinute()
  if (timestamps.length >= max) {
    const retryAfterMs = WINDOW_MS - (now - timestamps[0]!) + 500
    return {
      allowed: false,
      retryAfterMs,
      reason: `Valsea limit: ${max} requests per minute`,
    }
  }

  return { allowed: true }
}

export function recordValseaRequest() {
  prune(Date.now())
  timestamps.push(Date.now())
}

/** Call when upstream returns 429 / rate limit. */
export function setValseaCooldown(ms = 60_000) {
  cooldownUntil = Date.now() + ms
}

export function getValseaRateLimitStatus() {
  const now = Date.now()
  prune(now)
  const max = maxRequestsPerMinute()
  return {
    maxPerMinute: max,
    usedInWindow: timestamps.length,
    remaining: Math.max(0, max - timestamps.length),
    inCooldown: now < cooldownUntil,
    cooldownEndsInMs: Math.max(0, cooldownUntil - now),
  }
}
