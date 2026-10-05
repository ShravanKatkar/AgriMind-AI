"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import {
  browserSttLangForCode,
  createSpeechRecognition,
  isBrowserSpeechRecognitionSupported,
  joinSpokenText,
  type BrowserSpeechRecognition,
} from "@/lib/voice/speech-recognition"
import type { SupportedLanguage } from "@/types"

export interface RealtimeSpeechOptions {
  initialText?: string
  onTextChange: (text: string) => void
  /** Skip getUserMedia when the parent hook already opened the mic */
  micAlreadyGranted?: boolean
}

export function useRealtimeSpeechInput(language: SupportedLanguage) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState("")
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const keepAliveRef = useRef(false)
  const baseTextRef = useRef("")
  const latestTextRef = useRef("")
  const onChangeRef = useRef<(text: string) => void>(() => {})

  const supported = isBrowserSpeechRecognitionSupported()

  const applyDisplay = useCallback((text: string) => {
    latestTextRef.current = text
    setInterimText(text)
    onChangeRef.current(text)
  }, [])

  const start = useCallback(
    async (options: RealtimeSpeechOptions): Promise<boolean> => {
      if (!supported) return false

      const recognition = createSpeechRecognition()
      if (!recognition) return false

      if (!options.micAlreadyGranted) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch {
          toast.error("Microphone access denied.")
          return false
        }
      }

      baseTextRef.current = options.initialText?.trim() ?? ""
      latestTextRef.current = baseTextRef.current
      onChangeRef.current = options.onTextChange
      keepAliveRef.current = true

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = browserSttLangForCode(language)

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let sessionFinal = ""
        let sessionInterim = ""

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ""
          if (result.isFinal) {
            sessionFinal += transcript
          } else {
            sessionInterim += transcript
          }
        }

        const display = joinSpokenText(
          baseTextRef.current,
          joinSpokenText(sessionFinal, sessionInterim)
        )
        applyDisplay(display.trim() ? display : baseTextRef.current)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "aborted") return
        if (event.error === "no-speech") {
          return
        }
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied.")
        } else if (event.error !== "network") {
          toast.error(`Speech recognition: ${event.error}`)
        }
        keepAliveRef.current = false
        setIsListening(false)
      }

      recognition.onend = () => {
        if (keepAliveRef.current && recognitionRef.current) {
          baseTextRef.current = latestTextRef.current.trim()
          try {
            recognitionRef.current.start()
          } catch {
            keepAliveRef.current = false
            setIsListening(false)
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition

      try {
        recognition.start()
        setIsListening(true)
        applyDisplay(baseTextRef.current)
        return true
      } catch {
        recognitionRef.current = null
        keepAliveRef.current = false
        return false
      }
    },
    [applyDisplay, language, supported]
  )

  const stop = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      keepAliveRef.current = false
      const recognition = recognitionRef.current

      if (!recognition) {
        setIsListening(false)
        resolve(latestTextRef.current.trim())
        return
      }

      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        recognitionRef.current = null
        setIsListening(false)
        const text = latestTextRef.current.trim()
        applyDisplay(text)
        resolve(text)
      }

      const prevOnResult = recognition.onresult
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        prevOnResult?.(event)
        let sessionFinal = ""
        let sessionInterim = ""
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ""
          if (result.isFinal) sessionFinal += transcript
          else sessionInterim += transcript
        }
        const display = joinSpokenText(
          baseTextRef.current,
          joinSpokenText(sessionFinal, sessionInterim)
        )
        applyDisplay(display.trim() ? display : baseTextRef.current)
      }

      recognition.onend = finish
      try {
        recognition.stop()
      } catch {
        finish()
      }

      window.setTimeout(finish, 2500)
    })
  }, [applyDisplay])

  const toggle = useCallback(
    async (options: RealtimeSpeechOptions): Promise<string | null> => {
      if (isListening) return stop()
      const ok = await start(options)
      return ok ? null : null
    },
    [isListening, start, stop]
  )

  return {
    isListening,
    interimText,
    isSupported: supported,
    start,
    stop,
    toggle,
  }
}
