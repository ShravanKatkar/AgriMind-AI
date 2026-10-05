import {
  ensureVoicesLoaded,
  hasNativeBrowserVoice,
  pickVoiceForLanguage,
  speechLangTag,
} from "@/lib/voice/browser-voices"
import {
  defaultSpeakStrategy,
  type SpeakStrategy,
} from "@/lib/voice/tts-policy"
import {
  extractFirstSpeechChunk,
  prepareSpeechText,
  splitSpeechChunks,
} from "@/lib/voice/speech-chunks"
import type { SupportedLanguage } from "@/types"

export type { SpeakStrategy }

const MAX_TTS_CHARS = 4096
/** Smaller API chunks = faster first audio for Hindi/Marathi */
const SERVER_CHUNK_CHARS = 420

function truncateForTts(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TTS_CHARS) return trimmed
  return `${trimmed.slice(0, MAX_TTS_CHARS - 1)}…`
}

function ttsCacheKey(text: string, language: SupportedLanguage): string {
  return `${language}:${truncateForTts(text)}`
}

type SpeakCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

type SpeakOptions = {
  strategy?: SpeakStrategy
}

type TtsCacheEntry = {
  key: string
  objectUrl: string
}

let activeAudio: HTMLAudioElement | null = null
let activeObjectUrl: string | null = null
let activeUtterance: SpeechSynthesisUtterance | null = null
let chunkCancelRequested = false
let ttsCache: TtsCacheEntry | null = null
let ttsInflight: { key: string; promise: Promise<TtsCacheEntry | null> } | null =
  null

function revokeActiveAudio() {
  chunkCancelRequested = true
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ""
    activeAudio = null
  }
  if (activeObjectUrl && activeObjectUrl !== ttsCache?.objectUrl) {
    URL.revokeObjectURL(activeObjectUrl)
  }
  activeObjectUrl = null
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  activeUtterance = null
}

function clearTtsCache() {
  if (ttsCache) {
    URL.revokeObjectURL(ttsCache.objectUrl)
    ttsCache = null
  }
}

async function fetchTtsBlob(
  text: string,
  language: SupportedLanguage,
  signal?: AbortSignal
): Promise<Blob | null> {
  const res = await fetch("/api/voice/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: truncateForTts(text), language }),
    signal,
  })
  if (!res.ok) return null
  const blob = await res.blob()
  return blob.size > 0 ? blob : null
}

async function loadTtsCache(
  text: string,
  language: SupportedLanguage,
  signal?: AbortSignal
): Promise<TtsCacheEntry | null> {
  const key = ttsCacheKey(text, language)
  if (ttsCache?.key === key) return ttsCache

  if (ttsInflight?.key === key) {
    return ttsInflight.promise
  }

  const promise = (async () => {
    const blob = await fetchTtsBlob(text, language, signal)
    if (!blob) return null
    clearTtsCache()
    const entry: TtsCacheEntry = {
      key,
      objectUrl: URL.createObjectURL(blob),
    }
    ttsCache = entry
    return entry
  })()

  ttsInflight = { key, promise }
  try {
    return await promise
  } finally {
    if (ttsInflight?.key === key) ttsInflight = null
  }
}

export function prefetchSpeech(
  text: string,
  language: SupportedLanguage
): void {
  if (typeof window === "undefined" || !text.trim()) return
  const first = extractFirstSpeechChunk(text)
  const full = prepareSpeechText(text)
  const target = first ?? full.slice(0, 400)
  const key = ttsCacheKey(target, language)
  if (ttsCache?.key === key || ttsInflight?.key === key) return
  void loadTtsCache(target, language)
}

function splitServerTtsChunks(plain: string): string[] {
  const sentences = plain
    .split(/(?<=[.!?।॥])\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let buffer = ""

  const flush = () => {
    const t = buffer.trim()
    if (t) chunks.push(t)
    buffer = ""
  }

  for (const part of sentences.length ? sentences : [plain]) {
    if (!buffer) buffer = part
    else if (`${buffer} ${part}`.length <= SERVER_CHUNK_CHARS) {
      buffer = `${buffer} ${part}`
    } else {
      flush()
      buffer = part
    }
    if (buffer.length >= SERVER_CHUNK_CHARS) flush()
  }
  flush()

  return chunks.length ? chunks : [plain]
}

function speakChunkWithBrowser(
  chunk: string,
  language: SupportedLanguage,
  voice: SpeechSynthesisVoice | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("no speech synthesis"))
      return
    }

    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(chunk)
    utterance.lang = speechLangTag(language)
    utterance.rate = language === "en" ? 0.95 : 0.9
    utterance.pitch = 1
    if (voice) utterance.voice = voice

    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    activeUtterance = utterance
    utterance.onend = finish
    utterance.onerror = () => {
      if (chunkCancelRequested) finish()
      else reject(new Error("utterance error"))
    }

    synth.speak(utterance)
  })
}

function startSpeechKeepAlive(): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return () => {}
  }
  const synth = window.speechSynthesis
  const id = window.setInterval(() => {
    if (chunkCancelRequested || !synth.speaking) return
    synth.pause()
    synth.resume()
  }, 10_000)
  return () => window.clearInterval(id)
}

/** Browser TTS — best for English when a native voice exists */
function speakInstant(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks
): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  chunkCancelRequested = false
  const prepared = prepareSpeechText(text)
  const chunks = splitSpeechChunks(prepared)
  if (chunks.length === 0) {
    callbacks?.onError?.()
    return () => {}
  }

  let started = false
  let stopKeepAlive: (() => void) | null = null

  const cancel = () => {
    chunkCancelRequested = true
    stopKeepAlive?.()
    stopKeepAlive = null
    revokeActiveAudio()
  }

  void (async () => {
    const voices = await ensureVoicesLoaded()
    const voice = pickVoiceForLanguage(voices, language)

    stopKeepAlive = startSpeechKeepAlive()
    try {
      for (const chunk of chunks) {
        if (chunkCancelRequested) break
        if (!started) {
          started = true
          callbacks?.onStart?.()
        }
        await speakChunkWithBrowser(chunk, language, voice)
      }
      if (!chunkCancelRequested) {
        callbacks?.onEnd?.()
      }
    } catch {
      if (!chunkCancelRequested) {
        callbacks?.onError?.()
      }
    } finally {
      stopKeepAlive?.()
      stopKeepAlive = null
    }
  })()

  return cancel
}

function playAudioUrl(
  url: string,
  callbacks?: SpeakCallbacks,
  ownsBlobUrl = true
): Promise<boolean> {
  revokeActiveAudio()
  chunkCancelRequested = false
  if (ownsBlobUrl) {
    activeObjectUrl = url
  }
  activeAudio = new Audio(url)

  return new Promise((resolve) => {
    if (!activeAudio) {
      resolve(false)
      return
    }

    const audio = activeAudio

    const cleanup = () => {
      if (activeAudio === audio) {
        activeAudio.pause()
        activeAudio = null
      }
      if (ownsBlobUrl && activeObjectUrl === url) {
        URL.revokeObjectURL(url)
        activeObjectUrl = null
      }
    }

    audio.onplay = () => callbacks?.onStart?.()
    audio.onended = () => {
      cleanup()
      callbacks?.onEnd?.()
      resolve(true)
    }
    audio.onerror = () => {
      cleanup()
      callbacks?.onError?.()
      resolve(false)
    }

    audio.play().catch(() => {
      cleanup()
      callbacks?.onError?.()
      resolve(false)
    })
  })
}

function playAudioUrlAwaitEnd(url: string, ownsBlobUrl: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    void playAudioUrl(
      url,
      {
        onEnd: () => resolve(true),
        onError: () => resolve(false),
      },
      ownsBlobUrl
    )
  })
}

/**
 * OpenAI TTS in chunks — correct Hindi/Marathi; first chunk plays sooner.
 */
function speakNatural(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks
): () => void {
  const controller = new AbortController()
  let cancelled = false
  const prepared = prepareSpeechText(text)
  const apiChunks = splitServerTtsChunks(prepared)

  const cancel = () => {
    cancelled = true
    controller.abort()
    stopSpeaking()
  }

  void (async () => {
    let started = false

    for (const chunk of apiChunks) {
      if (cancelled) break

      let blob: Blob | null = null
      try {
        blob = await fetchTtsBlob(chunk, language, controller.signal)
      } catch {
        blob = null
      }

      if (!blob) {
        if (!cancelled) {
          const voices = await ensureVoicesLoaded()
          if (hasNativeBrowserVoice(voices, language)) {
            speakInstant(prepared, language, callbacks)
          } else {
            callbacks?.onError?.()
          }
        }
        return
      }

      const url = URL.createObjectURL(blob)
      if (!started) {
        started = true
        callbacks?.onStart?.()
      }

      const ok = await playAudioUrlAwaitEnd(url, true)
      if (!ok && !cancelled) {
        callbacks?.onError?.()
        return
      }
    }

    if (!cancelled && started) {
      callbacks?.onEnd?.()
    } else if (!cancelled && !started) {
      speakInstant(prepared, language, callbacks)
    }
  })()

  return cancel
}

/**
 * Speak reply aloud using browser-native Web Speech API.
 * Works for English, Hindi, and Marathi — completely free, no API keys needed.
 */
export function speakText(
  text: string,
  language: SupportedLanguage,
  callbacks?: SpeakCallbacks,
  options?: SpeakOptions
): () => void {
  if (typeof window === "undefined" || !text.trim()) {
    return () => {}
  }

  const prepared = prepareSpeechText(text)
  if (!prepared) {
    return () => {}
  }

  // Always use browser-native TTS (free, no API key required)
  return speakInstant(prepared, language, callbacks)
}

export function stopSpeaking(): void {
  revokeActiveAudio()
}

export function preloadVoices(): void {
  if (typeof window === "undefined") return
  void ensureVoicesLoaded()
}
