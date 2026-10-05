"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { voiceAssistantErrorMessage } from "@/lib/voice/friendly-error"
import { speakText, stopSpeaking, preloadVoices } from "@/lib/voice/tts"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

export interface VoiceUiMessage {
  id: string
  role: "user" | "assistant"
  content: string
  transcript?: string
  timestamp: Date
  streaming?: boolean
  error?: boolean
}

export type VoiceTurnResult = {
  reply: string | null
  error?: string
}

export function useVoiceAssistant(language: SupportedLanguage) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [useStreaming, setUseStreaming] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const resolveStopRef = useRef<((text: string | null) => void) | null>(null)
  const cancelSpeakRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    preloadVoices()
  }, [])

  const speak = useCallback(
    (text: string, turnLanguage?: SupportedLanguage) => {
      cancelSpeakRef.current?.()
      cancelSpeakRef.current = speakText(text, turnLanguage ?? language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    },
    [language]
  )

  const stopSpeakingNow = useCallback(() => {
    cancelSpeakRef.current?.()
    stopSpeaking()
    setIsSpeaking(false)
  }, [])

  const transcribeBlob = useCallback(
    async (blob: Blob): Promise<{ text: string | null; raw?: string }> => {
      const formData = new FormData()
      formData.append("file", blob, "recording.webm")
      formData.append("language", language)

      const res = await fetch("/api/valsea/transcribe", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Transcription failed")
      }
      return {
        text: json.data?.text ?? null,
        raw: json.data?.raw,
      }
    },
    [language]
  )

  const streamReply = useCallback(
    async (
      message: string,
      history: ChatMessageInput[],
      turnLanguage: SupportedLanguage,
      onDelta: (text: string) => void
    ): Promise<string | null> => {
      const res = await fetch("/api/ai/assist/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language: turnLanguage, history }),
      })

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? "Stream failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const payload = line.slice(6).trim()
          if (payload === "[DONE]") continue
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              full += parsed.text.replace(/\*/g, "")
              onDelta(full)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }

      return full ? full.replace(/\*/g, "") : null
    },
    [language]
  )

  const persistTurn = useCallback(
    async (
      userContent: string,
      assistantContent: string,
      turnLanguage: SupportedLanguage,
      transcript?: string
    ) => {
      const res = await fetch("/api/voice/save-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          language: turnLanguage,
          userMessage: { content: userContent, transcript },
          assistantMessage: { content: assistantContent },
        }),
      })
      const json = await res.json()
      if (res.ok && json.data?.conversationId) {
        setConversationId(json.data.conversationId)
      }
    },
    [conversationId]
  )

  const processTurn = useCallback(
    async (
      message: string,
      history: ChatMessageInput[],
      options?: {
        transcript?: string
        language?: SupportedLanguage
        onAssistantUpdate?: (content: string, streaming: boolean) => void
      }
    ): Promise<VoiceTurnResult> => {
      const turnLanguage = options?.language ?? language
      setIsProcessing(true)
      try {
        if (useStreaming) {
          options?.onAssistantUpdate?.("", true)
          const reply = await streamReply(
            message,
            history,
            turnLanguage,
            (partial) => {
              options?.onAssistantUpdate?.(partial, true)
            }
          )
          if (!reply) throw new Error("Empty response")
          options?.onAssistantUpdate?.(reply, false)
          await persistTurn(message, reply, turnLanguage, options?.transcript)
          return { reply }
        }

        const res = await fetch("/api/voice/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            language: turnLanguage,
            conversationId,
            transcript: options?.transcript,
            history,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Assistant request failed")
        setConversationId(json.data.conversationId)
        const cleanReply = (json.data.reply as string)?.replace(/\*/g, "")
        return { reply: cleanReply }
      } catch (err) {
        const raw = err instanceof Error ? err.message : undefined
        return { reply: null, error: voiceAssistantErrorMessage(raw) }
      } finally {
        setIsProcessing(false)
      }
    },
    [conversationId, language, persistTurn, streamReply, useStreaming]
  )

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setIsListening(false)

        let text: string | null = null
        let raw: string | undefined
        const blob = new Blob(chunksRef.current, { type: mimeType })

        if (blob.size >= 1000) {
          setIsProcessing(true)
          try {
            const result = await transcribeBlob(blob)
            text = result.text
            raw = result.raw
            if (!text) {
              toast.error("Could not understand audio. Please try again.")
            }
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Transcription failed"
            )
          } finally {
            setIsProcessing(false)
          }
        } else {
          toast.error("Recording too short. Please try again.")
        }

        resolveStopRef.current?.(text ? JSON.stringify({ text, raw }) : null)
        resolveStopRef.current = null
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsListening(true)
    } catch {
      toast.error("Microphone access denied. Please allow microphone permission.")
    }
  }, [transcribeBlob])

  const stopListening = useCallback((): Promise<{ text: string; raw?: string } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === "inactive") {
        resolve(null)
        return
      }
      resolveStopRef.current = (payload) => {
        if (!payload) {
          resolve(null)
          return
        }
        try {
          const parsed = JSON.parse(payload) as { text: string; raw?: string }
          resolve(parsed)
        } catch {
          resolve({ text: payload })
        }
      }
      recorder.stop()
    })
  }, [])

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/voice/conversations/${id}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to load")
    setConversationId(id)
    return json.data as {
      messages: { role: "user" | "assistant"; content: string; transcript?: string; createdAt: string }[]
      language: SupportedLanguage
    }
  }, [])

  const startNewConversation = useCallback(() => {
    setConversationId(null)
  }, [])

  return {
    isListening,
    isProcessing,
    isSpeaking,
    conversationId,
    useStreaming,
    setUseStreaming,
    startListening,
    stopListening,
    processTurn,
    speak,
    stopSpeaking: stopSpeakingNow,
    loadConversation,
    startNewConversation,
  }
}
