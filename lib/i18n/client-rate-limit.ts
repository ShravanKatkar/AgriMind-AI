const STORAGE_KEY = "agrimind-valsea-client-limit"
const WINDOW_MS = 60_000
const MAX_LIVE_BATCHES_PER_MINUTE = 2

interface ClientLimitState {
  batches: number[]
  blockedUntil: number
}

function readState(): ClientLimitState {
  if (typeof window === "undefined") {
    return { batches: [], blockedUntil: 0 }
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { batches: [], blockedUntil: 0 }
    return JSON.parse(raw) as ClientLimitState
  } catch {
    return { batches: [], blockedUntil: 0 }
  }
}

function writeState(state: ClientLimitState) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function pruneBatches(batches: number[], now: number): number[] {
  return batches.filter((t) => now - t < WINDOW_MS)
}

export function canRequestLiveTranslation(): boolean {
  const now = Date.now()
  const state = readState()
  if (now < state.blockedUntil) return false
  const batches = pruneBatches(state.batches, now)
  return batches.length < MAX_LIVE_BATCHES_PER_MINUTE
}

export function recordLiveTranslationBatch() {
  const now = Date.now()
  const state = readState()
  const batches = pruneBatches(state.batches, now)
  batches.push(now)
  writeState({ batches, blockedUntil: state.blockedUntil })
}

export function blockLiveTranslation(ms: number) {
  const state = readState()
  writeState({
    batches: state.batches,
    blockedUntil: Date.now() + ms,
  })
}

export function getLiveTranslationCooldownMs(): number {
  const state = readState()
  return Math.max(0, state.blockedUntil - Date.now())
}
