"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { useRealtimeSpeechInput } from "@/hooks/use-realtime-speech-input"
import {
  isBrowserSpeechRecognitionSupported,
  prefersValseaVoiceTranscription,
  supportsLiveBrowserStt,
} from "@/lib/voice/speech-recognition"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import {
  audioFilenameForMime,
  pickAudioMimeType,
} from "@/lib/voice/recording"
import {
  AUTO_DETECT_LANGUAGE,
  isAutoDetectLanguage,
  type VoiceLanguagePreference,
} from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

type VoiceInputOptions = {
  initialText?: string
  onTextChange?: (text: string) => void
}

const MIN_RECORDING_BYTES = 1200
const MIN_RECORDING_MS = 700
const PARTIAL_INTERVAL_MS = 1200
const FIRST_PARTIAL_MS = 550
const MAX_PARTIAL_TRANSCRIBES = 12
const RECORDER_DELAY_MS = 450

/** Optional tuning — AI Chat uses VALSEA + faster live typing */
export type VoiceInputConfig = {
  /** Always use VALSEA transcribe with live text in the box (recommended for chat) */
  preferValsea?: boolean
  /** Shorter intervals between partial transcriptions while speaking */
  fasterLiveUpdates?: boolean
}

export type VoiceStopResult = {
  text: string | null
  errorShown: boolean
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Mic: words appear in the text box while speaking */
export function useVoiceInput(
  languagePreference: VoiceLanguagePreference,
  config?: VoiceInputConfig
) {
  const forceValsea = config?.preferValsea ?? false
  const partialIntervalMs = config?.fasterLiveUpdates ? 750 : PARTIAL_INTERVAL_MS
  const firstPartialMs = config?.fasterLiveUpdates ? 350 : FIRST_PARTIAL_MS
  const maxPartialTranscribes = config?.fasterLiveUpdates
    ? 24
    : MAX_PARTIAL_TRANSCRIBES
  const recorderTimesliceMs = config?.fasterLiveUpdates ? 280 : 400
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isPartialTranscribing, setIsPartialTranscribing] = useState(false)
  const [liveText, setLiveText] = useState("")
  const [browserSttActive, setBrowserSttActive] = useState(false)

  const sttLanguage: SupportedLanguage = isAutoDetectLanguage(languagePreference)
    ? "en"
    : languagePreference

  const realtime = useRealtimeSpeechInput(sttLanguage)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef("audio/webm")
  const recordStartedAtRef = useRef(0)
  const resolveStopRef = useRef<((text: string | null) => void) | null>(null)
  const skipTranscribeRef = useRef(false)
  const optionsRef = useRef<VoiceInputOptions>({})
  const lastErrorShownRef = useRef(false)
  const partialCountRef = useRef(0)
  const lastPartialAtRef = useRef(0)
  const partialInFlightRef = useRef(false)
  const browserSttActiveRef = useRef(false)
  const setBrowserStt = useCallback((active: boolean) => {
    browserSttActiveRef.current = active
    setBrowserSttActive(active)
  }, [])
  const useChunkedLiveRef = useRef(false)
  const partialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const liveTextRef = useRef("")

  const transcribeLanguage: SupportedLanguage | "auto" =
    isAutoDetectLanguage(languagePreference)
      ? AUTO_DETECT_LANGUAGE
      : languagePreference

  const prefersValsea =
    forceValsea || prefersValseaVoiceTranscription(languagePreference)

  const liveSttCapable =
    !prefersValsea &&
    isBrowserSpeechRecognitionSupported() &&
    supportsLiveBrowserStt(languagePreference)

  const needsRecorderOnListen =
    prefersValsea ||
    isAutoDetectLanguage(languagePreference) ||
    !liveSttCapable

  const pushLiveText = useCallback((text: string) => {
    liveTextRef.current = text
    setLiveText(text)
    optionsRef.current.onTextChange?.(text)
  }, [])

  const transcribeBlob = useCallback(
    async (blob: Blob, filename: string): Promise<string | null> => {
      const formData = new FormData()
      formData.append("file", blob, filename)
      formData.append("language", transcribeLanguage)

      const res = await fetch("/api/valsea/transcribe", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Transcription failed")
      return json.data?.text ?? null
    },
    [transcribeLanguage]
  )

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const clearPartialTimer = useCallback(() => {
    if (partialTimerRef.current) {
      clearInterval(partialTimerRef.current)
      partialTimerRef.current = null
    }
  }, [])

  const runPartialTranscribe = useCallback(async () => {
    if (
      partialInFlightRef.current ||
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== "recording"
    ) {
      return
    }

    const totalBytes = chunksRef.current.reduce((s, c) => s + c.size, 0)
    if (totalBytes < MIN_RECORDING_BYTES) return

    partialInFlightRef.current = true
    setIsPartialTranscribing(true)

    try {
      const blob = new Blob(chunksRef.current, {
        type: mimeTypeRef.current,
      })
      const text = await transcribeBlob(
        blob,
        audioFilenameForMime(mimeTypeRef.current)
      )
      if (text?.trim() && mediaRecorderRef.current?.state === "recording") {
        pushLiveText(text.trim())
      }
    } catch {
      /* best-effort live updates */
    } finally {
      partialInFlightRef.current = false
      if (mediaRecorderRef.current?.state === "recording") {
        setIsPartialTranscribing(false)
      }
    }
  }, [pushLiveText, transcribeBlob])

  const maybeSchedulePartialTranscribe = useCallback(() => {
    if (!useChunkedLiveRef.current) return
    const now = Date.now()
    if (partialCountRef.current >= maxPartialTranscribes) return
    if (now - recordStartedAtRef.current < firstPartialMs) return
    if (now - lastPartialAtRef.current < partialIntervalMs) return

    lastPartialAtRef.current = now
    partialCountRef.current += 1
    void runPartialTranscribe()
  }, [firstPartialMs, maxPartialTranscribes, partialIntervalMs, runPartialTranscribe])

  const startPartialTimer = useCallback(() => {
    clearPartialTimer()
    partialTimerRef.current = setInterval(() => {
      maybeSchedulePartialTranscribe()
    }, partialIntervalMs)
  }, [clearPartialTimer, maybeSchedulePartialTranscribe, partialIntervalMs])

  const stopRecorderAndTranscribe = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === "inactive") {
        releaseStream()
        resolve(null)
        return
      }

      resolveStopRef.current = resolve
      try {
        if (recorder.state === "recording") {
          recorder.requestData()
        }
        recorder.stop()
      } catch {
        releaseStream()
        resolve(null)
        resolveStopRef.current = null
      }
    })
  }, [releaseStream])

  const beginRecorder = useCallback(
    (stream: MediaStream): boolean => {
      try {
        const mimeType = pickAudioMimeType()
        mimeTypeRef.current = mimeType

        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        )
        chunksRef.current = []
        partialCountRef.current = 0
        lastPartialAtRef.current = 0
        recordStartedAtRef.current = Date.now()

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
            maybeSchedulePartialTranscribe()
          }
        }

        recorder.onstop = async () => {
          setIsRecording(false)
          setIsPartialTranscribing(false)
          clearPartialTimer()
          releaseStream()
          mediaRecorderRef.current = null

          if (skipTranscribeRef.current) {
            skipTranscribeRef.current = false
            resolveStopRef.current?.(null)
            resolveStopRef.current = null
            return
          }

          let text: string | null = null
          const blob = new Blob(chunksRef.current, {
            type: mimeTypeRef.current,
          })
          const filename = audioFilenameForMime(mimeTypeRef.current)
          const durationMs = Date.now() - recordStartedAtRef.current

          if (
            blob.size >= MIN_RECORDING_BYTES &&
            durationMs >= MIN_RECORDING_MS
          ) {
            setIsTranscribing(true)
            try {
              text = await transcribeBlob(blob, filename)
              if (!text?.trim()) {
                lastErrorShownRef.current = true
                toast.error(
                  "Could not understand your voice. Speak clearly and try again."
                )
              }
            } catch (err) {
              lastErrorShownRef.current = true
              toast.error(
                err instanceof Error ? err.message : "Transcription failed"
              )
            } finally {
              setIsTranscribing(false)
            }
          } else if (useChunkedLiveRef.current && !browserSttActiveRef.current) {
            lastErrorShownRef.current = true
            toast.error(
              "Recording too short. Hold the mic, speak for at least a second, then tap red."
            )
          }

          if (text?.trim()) {
            pushLiveText(text.trim())
          }

          resolveStopRef.current?.(text?.trim() ?? null)
          resolveStopRef.current = null
        }

        mediaRecorderRef.current = recorder
        recorder.start(recorderTimesliceMs)
        setIsRecording(true)
        if (useChunkedLiveRef.current) {
          startPartialTimer()
          window.setTimeout(() => maybeSchedulePartialTranscribe(), firstPartialMs)
        }
        return true
      } catch {
        return false
      }
    },
    [
      clearPartialTimer,
      firstPartialMs,
      maybeSchedulePartialTranscribe,
      pushLiveText,
      recorderTimesliceMs,
      releaseStream,
      startPartialTimer,
      transcribeBlob,
    ]
  )

  const acquireMic = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      return stream
    } catch {
      lastErrorShownRef.current = true
      toast.error("Microphone access denied. Allow mic in browser settings.")
      return null
    }
  }, [])

  const startListening = useCallback(
    async (options?: VoiceInputOptions): Promise<boolean> => {
      lastErrorShownRef.current = false
      setBrowserStt(false)
      useChunkedLiveRef.current = false
      optionsRef.current = options ?? {}
      const initial = options?.initialText?.trim() ?? ""
      pushLiveText(initial)

      const stream = await acquireMic()
      if (!stream) return false

      let browserSttOk = false
      if (liveSttCapable) {
        browserSttOk = await realtime.start({
          initialText: initial,
          onTextChange: (text) => {
            pushLiveText(text)
          },
          micAlreadyGranted: true,
        })
        setBrowserStt(browserSttOk)
      }

      useChunkedLiveRef.current = prefersValsea || !browserSttOk

      if (browserSttOk && !needsRecorderOnListen) {
        toast.message("Listening… speak and watch words type in the box", {
          duration: 3500,
        })
        return true
      }

      if (browserSttOk && needsRecorderOnListen) {
        await delay(RECORDER_DELAY_MS)
      }

      if (!beginRecorder(stream)) {
        releaseStream()
        if (browserSttOk) {
          toast.message("Listening… speak and watch words type in the box", {
            duration: 3500,
          })
          return true
        }
        return false
      }

      if (prefersValsea) {
        const langLabel = isAutoDetectLanguage(languagePreference)
          ? "your language"
          : getLanguageDisplayLabel(languagePreference)
        toast.message(
          forceValsea
            ? `Speak in ${langLabel} — your words type here as you talk`
            : `Listening — speak in ${langLabel}, text appears in the box`,
          { duration: 4000 }
        )
      } else if (browserSttOk) {
        toast.message("Listening… words type live as you speak", {
          duration: 3500,
        })
      } else {
        toast.message("Listening… your speech types into the box", {
          duration: 3500,
        })
      }

      return true
    },
    [
      acquireMic,
      beginRecorder,
      liveSttCapable,
      needsRecorderOnListen,
      languagePreference,
      forceValsea,
      prefersValsea,
      pushLiveText,
      realtime,
      releaseStream,
    ]
  )

  const stopListening = useCallback(async (): Promise<VoiceStopResult> => {
    clearPartialTimer()
    let liveSttText = ""

    if (realtime.isListening) {
      liveSttText = (await realtime.stop()).trim()
      if (liveSttText) {
        pushLiveText(liveSttText)
      }
    }
    setBrowserStt(false)

    const hasRecorder =
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"

    let valseaText: string | null = null
    const shouldUseValsea =
      prefersValsea ||
      isAutoDetectLanguage(languagePreference) ||
      liveSttText.length < 2 ||
      !liveSttCapable ||
      Boolean(hasRecorder)

    if (liveSttText.length >= 2 && !shouldUseValsea) {
      skipTranscribeRef.current = true
      if (hasRecorder) {
        await stopRecorderAndTranscribe()
      } else {
        releaseStream()
      }
    } else if (hasRecorder) {
      valseaText = (await stopRecorderAndTranscribe())?.trim() ?? null
    } else {
      releaseStream()
    }

    const merged =
      shouldUseValsea && valseaText
        ? valseaText
        : liveSttText || valseaText || null

    const buffered = liveTextRef.current.trim()
    const finalText = (merged?.trim() || buffered || null) || null

    if (finalText) {
      pushLiveText(finalText)
    }

    useChunkedLiveRef.current = false

    return {
      text: finalText,
      errorShown: lastErrorShownRef.current,
    }
  }, [
    clearPartialTimer,
    languagePreference,
    liveSttCapable,
    prefersValsea,
    pushLiveText,
    realtime,
    releaseStream,
    stopRecorderAndTranscribe,
  ])

  const toggleListening = useCallback(
    async (options?: VoiceInputOptions): Promise<VoiceStopResult | null> => {
      if (isRecording || realtime.isListening) {
        return stopListening()
      }
      const ok = await startListening(options)
      return ok ? null : { text: null, errorShown: lastErrorShownRef.current }
    },
    [isRecording, realtime.isListening, startListening, stopListening]
  )

  const isListening = isRecording || realtime.isListening
  const isChunkedLiveTyping =
    isListening && isRecording && !browserSttActive

  return {
    isListening,
    isTranscribing,
    isPartialTranscribing,
    liveText,
    interimText: realtime.interimText || liveText,
    isLiveTypingSupported: liveSttCapable,
    isBrowserSttActive: browserSttActive,
    usesValseaVoice: prefersValsea,
    isChunkedLiveTyping,
    startListening,
    stopListening,
    toggleListening,
  }
}
