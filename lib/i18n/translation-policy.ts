/** How AgriMind uses translation APIs (Valsea / OpenAI). */

/** UI shell + landing: built-in strings only — no API on language change. */
export const UI_USES_STATIC_TRANSLATIONS = true

/** Marketing page DOM scan: static + browser cache only (no live API). */
export const PAGE_DOM_USES_LIVE_API = false

/**
 * All text translation uses OpenAI. Valsea is reserved for voice transcribe only.
 * This avoids Valsea translate rate limits (≈20/min).
 */
export const TEXT_TRANSLATION_USES_OPENAI = true

/** Max live API strings per user action (diagnosis report, etc.). */
export const LIVE_TRANSLATE_MAX_STRINGS = 12

/** Min milliseconds between live batch API calls (per browser tab). */
export const LIVE_TRANSLATE_MIN_INTERVAL_MS = 60_000

/** Max strings per single live batch request. */
export const LIVE_TRANSLATE_CHUNK_SIZE = 8

/** Show error toast when live translate fails (off = silent English fallback). */
export const SHOW_LIVE_TRANSLATE_ERROR_TOAST = false
