"use client"

import { motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  History,
  Trash2,
  Plus,
  Zap,
  Loader2,
  Globe,
  Square,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiveVoiceTextarea } from "@/components/dashboard/voice/live-voice-textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useVoiceAssistant,
  type VoiceUiMessage,
} from "@/hooks/use-voice-assistant"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useVoiceConversations } from "@/hooks/use-voice-conversations"
import { VoiceMicButton } from "@/components/dashboard/voice/voice-mic-button"
import { VoiceMessageActions } from "@/components/dashboard/voice/voice-message-actions"
import { VoiceLanguageSelect } from "@/components/dashboard/voice/voice-language-select"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { getVoiceWelcomeMessage } from "@/lib/voice/welcome"
import { stripAsterisks } from "@/lib/chat/clean-text"
import { hasSpeakableSentence } from "@/lib/voice/speech-chunks"
import { prefetchSpeech } from "@/lib/voice/tts"
import { toast } from "sonner"
import type { SupportedLanguage } from "@/types"
import type { ChatMessageInput } from "@/types/ai"
import { formatDistanceToNow } from "date-fns"
import {
  AUTO_DETECT_LANGUAGE,
  getLanguageDisplayLabel,
  isAutoDetectLanguage,
  isSupportedLanguage,
  type VoiceLanguagePreference,
} from "@/lib/i18n/languages"
import { detectUserLanguage } from "@/lib/voice/detect-language"
import {
  getStoredVoiceLanguageMode,
  setStoredVoiceLanguageMode,
} from "@/lib/voice/language-preference"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const quickPrompts = [
  "My tomato leaves are turning yellow",
  "When should I water my rice crops?",
  "Best fertilizer for chili and onion",
  "टमाटर के पत्तों पर पीले धब्बे कैसे ठीक करें?",
  "कांद्यासाठी खताचे योग्य नियोजन कसे करावे?",
]

function toHistory(messages: VoiceUiMessage[]): ChatMessageInput[] {
  return messages
    .filter((m) => !m.streaming && m.content.trim())
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }))
}

export default function VoiceAssistantPage() {
  const [languageMode, setLanguageMode] =
    useState<VoiceLanguagePreference>(() => getStoredVoiceLanguageMode())
  const [languageOptionsOpen, setLanguageOptionsOpen] = useState(false)
  const detectToastShownRef = useRef(false)
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>("en")
  const [lastDetected, setLastDetected] = useState<SupportedLanguage | null>(
    null
  )
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [messages, setMessages] = useState<VoiceUiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: getVoiceWelcomeMessage(AUTO_DETECT_LANGUAGE),
      timestamp: new Date(),
    },
  ])

  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const assistantIdRef = useRef<string | null>(null)
  const speechPrefetchRef = useRef(false)

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "auto") => {
    requestAnimationFrame(() => {
      const container = messagesScrollRef.current
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior })
        return
      }
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" })
    })
  }, [])

  const {
    isProcessing,
    isSpeaking,
    useStreaming,
    setUseStreaming,
    processTurn,
    speak,
    stopSpeaking,
    loadConversation,
    startNewConversation,
    conversationId,
  } = useVoiceAssistant(activeLanguage)

  const {
    isListening,
    isTranscribing,
    isPartialTranscribing,
    isLiveTypingSupported,
    isChunkedLiveTyping,
    usesValseaVoice,
    startListening,
    stopListening,
  } = useVoiceInput(languageMode)

  const { conversations, loading: historyLoading, refresh, remove } =
    useVoiceConversations()

  useEffect(() => {
    const streaming = messages.some((m) => m.streaming)
    scrollToLatest(streaming ? "auto" : "smooth")
  }, [messages, scrollToLatest])

  useEffect(() => {
    if (!isProcessing) {
      scrollToLatest("smooth")
    }
  }, [isProcessing, scrollToLatest])

  useEffect(() => {
    if (!isSpeaking) setSpeakingId(null)
  }, [isSpeaking])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isListening) {
      interval = setInterval(() => setAudioLevel(Math.random() * 100), 100)
    } else {
      setAudioLevel(0)
    }
    return () => clearInterval(interval)
  }, [isListening])

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getVoiceWelcomeMessage(languageMode),
        timestamp: new Date(),
      },
    ])
    setLastDetected(null)
    if (!isAutoDetectLanguage(languageMode)) {
      setActiveLanguage(languageMode)
    }
    startNewConversation()
  }, [languageMode, startNewConversation])

  const fetchFollowUps = async (
    reply: string,
    turnLanguage: SupportedLanguage
  ) => {
    try {
      const res = await fetch("/api/voice/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply, language: turnLanguage }),
      })
      const json = await res.json()
      if (res.ok) setFollowUps(json.data ?? [])
    } catch {
      setFollowUps([])
    }
  }

  const handleStopVoice = () => {
    stopSpeaking()
    setSpeakingId(null)
  }

  const resolveTurnLanguage = async (
    text: string
  ): Promise<SupportedLanguage> => {
    if (!isAutoDetectLanguage(languageMode)) {
      return languageMode
    }
    const detected = await detectUserLanguage(text)
    setLastDetected(detected)
    setActiveLanguage(detected)
    return detected
  }

  const runTurn = async (userText: string, transcript?: string) => {
    handleStopVoice()
    setFollowUps([])

    const turnLanguage = await resolveTurnLanguage(userText)
    if (isAutoDetectLanguage(languageMode) && !detectToastShownRef.current) {
      detectToastShownRef.current = true
      toast.message(
        `Speaking ${getLanguageDisplayLabel(turnLanguage)} — replies will match your language`,
        { duration: 3200 }
      )
    }
    const userMsg: VoiceUiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      transcript,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    scrollToLatest("auto")

    const assistantId = `a-${Date.now()}`
    assistantIdRef.current = assistantId
    speechPrefetchRef.current = false
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      },
    ])
    scrollToLatest("auto")

    const history = toHistory(messages)
    const { reply, error } = await processTurn(userText, history, {
      transcript,
      language: turnLanguage,
      onAssistantUpdate: (content, streaming) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content, streaming } : m
          )
        )
        if (
          streaming &&
          content.trim() &&
          !isMuted &&
          !speechPrefetchRef.current &&
          hasSpeakableSentence(content)
        ) {
          speechPrefetchRef.current = true
          prefetchSpeech(content, turnLanguage)
        }
        if (!streaming) {
          if (content.trim() && !isMuted) {
            prefetchSpeech(content, turnLanguage)
          }
          scrollToLatest("auto")
        }
      },
    })

    if (!reply) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: error ?? "Sorry, I couldn't answer right now.",
                streaming: false,
                error: true,
              }
            : m
        )
      )
      scrollToLatest("auto")
      return
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: reply, streaming: false, error: false }
          : m
      )
    )
    scrollToLatest("auto")

    if (!isMuted) {
      prefetchSpeech(reply, turnLanguage)
      setSpeakingId(assistantId)
      speak(reply, turnLanguage)
    }
    void fetchFollowUps(reply, turnLanguage)
    refresh()
  }

  const handleVoiceToggle = async () => {
    if (isProcessing && !isListening) return

    if (isSpeaking) {
      handleStopVoice()
    }

    if (isListening) {
      const { text, errorShown } = await stopListening()
      const finalText = (text ?? textInput).trim()
      setTextInput(finalText)
      textareaRef.current?.focus()
      if (!finalText && !errorShown) {
        toast.error(
          usesValseaVoice
            ? `No speech detected. Speak clearly in ${getLanguageDisplayLabel(
                isAutoDetectLanguage(languageMode)
                  ? lastDetected ?? activeLanguage
                  : languageMode
              )}, hold the mic 2+ seconds, then tap red again.`
            : "No speech detected. Check your microphone, speak clearly, then tap the red button again."
        )
      } else if (finalText) {
        toast.message("Text ready — edit if needed, then tap Send", {
          duration: 3500,
        })
      }
      return
    }

    handleStopVoice()
    const started = await startListening({
      initialText: textInput,
      onTextChange: setTextInput,
    })
    if (!started) return
    textareaRef.current?.focus()
  }

  const handleTextSubmit = async () => {
    if (isProcessing) return

    let text = textInput.trim()
    if (isListening) {
      const { text: heard } = await stopListening()
      if (heard?.trim()) text = heard.trim()
      else text = textInput.trim()
    }
    if (!text) return

    setTextInput("")
    await runTurn(text)
  }

  const handleLoadConversation = async (id: string) => {
    try {
      const data = await loadConversation(id)
      const loaded = isSupportedLanguage(data.language) ? data.language : "en"
      setLanguageMode(loaded)
      setActiveLanguage(loaded)
      setLastDetected(loaded)
      setMessages(
        data.messages.map((m, i) => ({
          id: `${id}-${i}`,
          role: m.role,
          content: m.content,
          transcript: m.transcript,
          timestamp: new Date(m.createdAt),
        }))
      )
      setShowHistory(false)
      setFollowUps([])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load chat")
    }
  }

  const handleNewChat = () => {
    if (isListening) void stopListening()
    handleStopVoice()
    startNewConversation()
    setFollowUps([])
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: getVoiceWelcomeMessage(languageMode),
        timestamp: new Date(),
      },
    ])
    setShowHistory(false)
  }

  const replyLanguage = isAutoDetectLanguage(languageMode)
    ? activeLanguage
    : languageMode
  const motherTongueVoice = replyLanguage !== "en"

  const statusText = isTranscribing
    ? "Finalizing your voice to text…"
    : isPartialTranscribing
      ? "Typing what you said…"
      : isListening
        ? usesValseaVoice
          ? textInput.trim()
            ? "VALSEA is typing — keep speaking, then tap red when done"
            : `Speak in ${getLanguageDisplayLabel(
                isAutoDetectLanguage(languageMode) ? activeLanguage : languageMode
              )} — VALSEA puts words in the box`
          : textInput.trim()
            ? "Keep speaking — text updates live in the box below"
            : "Say hello (or anything) — it will type in the box as you speak"
        : isSpeaking
          ? "AI voice playing — tap Stop voice to interrupt"
          : isProcessing
            ? motherTongueVoice
              ? `AgriMind is thinking… ${getLanguageDisplayLabel(replyLanguage)} voice will play when ready`
              : "AgriMind is thinking… voice starts quickly when the answer is ready"
            : "Tap green mic · speak · your words type live in the box · tap red when done · Send"

  return (
    <motion.div className="-m-6 flex min-h-[calc(100dvh-4rem)] w-[calc(100%+3rem)] flex-col">
      <motion.div className="shrink-0 border-b border-border bg-card/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {isAutoDetectLanguage(languageMode)
                ? "Auto detect · VALSEA"
                : usesValseaVoice
                  ? `${getLanguageDisplayLabel(languageMode)} · VALSEA voice`
                  : isLiveTypingSupported
                    ? "Live typing"
                    : "Live voice → text"}
            </Badge>
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <Globe className="h-3 w-3" />
              VALSEA.ai
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              {useStreaming ? "Live stream" : "Standard"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Voice Assistant</h1>
          <p className="text-muted-foreground">
            Speak in your mother tongue — Hindi, Marathi, or English.
            AgriMind answers in the same language. No need to
            pick a language first.
            {lastDetected && isAutoDetectLanguage(languageMode) && (
              <span className="mt-1 block font-medium text-primary">
                Now using: {getLanguageDisplayLabel(lastDetected)}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <Collapsible
            open={languageOptionsOpen}
            onOpenChange={setLanguageOptionsOpen}
          >
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={isProcessing || isListening}
              >
                <Globe className="h-4 w-4" />
                {isAutoDetectLanguage(languageMode)
                  ? "Auto language"
                  : getLanguageDisplayLabel(languageMode)}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 flex justify-end">
              <VoiceLanguageSelect
                value={languageMode}
                onChange={(mode) => {
                  setLanguageMode(mode)
                  setStoredVoiceLanguageMode(mode)
                  if (isAutoDetectLanguage(mode)) {
                    detectToastShownRef.current = false
                  }
                }}
                detectedLanguage={lastDetected}
                disabled={isProcessing || isListening}
              />
            </CollapsibleContent>
          </Collapsible>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
          >
            <History className="mr-1 h-4 w-4" />
            History
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New chat
          </Button>
          <WhatsAppSupportButton size="sm" />
        </div>
      </div>

      </motion.div>

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:mx-6">
        <div
          ref={messagesScrollRef}
          className="min-h-0 flex-1 overflow-y-auto scroll-smooth p-4 sm:p-8"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(100%,42rem)] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : message.error
                          ? "border border-amber-500/40 bg-amber-500/10 rounded-tl-md"
                          : "border border-border bg-muted/50 rounded-tl-md"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-2">
                        <Sparkles
                          className={`h-4 w-4 ${message.error ? "text-amber-600" : "text-primary"}`}
                        />
                        <span
                          className={`text-xs font-medium ${message.error ? "text-amber-700 dark:text-amber-400" : "text-primary"}`}
                        >
                          {message.error ? "Notice" : "AgriMind AI"}
                        </span>
                        {message.streaming && (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        )}
                      </div>
                    )}
                    <p
                      className={
                        message.role === "user"
                          ? "text-primary-foreground whitespace-pre-wrap"
                          : "text-foreground whitespace-pre-wrap"
                      }
                    >
                      {stripAsterisks(message.content) ||
                        (message.streaming ? "…" : "")}
                    </p>
                    {message.role === "assistant" &&
                      message.content &&
                      !message.streaming &&
                      !message.error &&
                      message.id !== "welcome" && (
                        <VoiceMessageActions
                          content={message.content}
                          isSpeaking={speakingId === message.id && isSpeaking}
                          onSpeak={() => {
                            setSpeakingId(message.id)
                            speak(message.content, activeLanguage)
                          }}
                          onStop={handleStopVoice}
                        />
                      )}
                    {message.transcript &&
                      message.transcript !== message.content && (
                        <p className="mt-1 text-xs opacity-70">
                          Heard: {message.transcript}
                        </p>
                      )}
                    <p
                      className={`mt-1 text-xs ${
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <motion.div ref={messagesEndRef} className="h-px shrink-0" aria-hidden="true" />
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-muted/30 p-6 sm:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-5">
              <VoiceMicButton
                size="large"
                isListening={isListening || isTranscribing}
                isSpeaking={isSpeaking}
                isProcessing={isProcessing && !isListening && !isTranscribing}
                audioLevel={audioLevel}
                onClick={handleVoiceToggle}
              />

              <p className="text-center text-sm font-medium text-muted-foreground">
                {statusText}
              </p>

              {isSpeaking && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="gap-2 border-red-500/50 bg-red-500/10 text-red-600 shadow-sm hover:bg-red-500/20 dark:text-red-400"
                    onClick={handleStopVoice}
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Stop voice
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="stream"
                    checked={useStreaming}
                    onCheckedChange={setUseStreaming}
                  />
                  <Label htmlFor="stream" className="text-xs">
                    Realtime stream
                  </Label>
                </div>
                {isSpeaking ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    onClick={handleStopVoice}
                    aria-label="Stop voice"
                  >
                    <Square className="h-5 w-5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsMuted(!isMuted)
                      if (!isMuted) handleStopVoice()
                    }}
                    aria-label={isMuted ? "Unmute replies" : "Mute replies"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <LiveVoiceTextarea
                  ref={textareaRef}
                  value={textInput}
                  isListening={isListening}
                  animateChunked={isChunkedLiveTyping}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={
                    isTranscribing
                      ? "Finalizing speech to text…"
                      : isListening
                        ? "Say something — e.g. hello — it types here live…"
                        : isProcessing
                          ? "Waiting for AI answer…"
                          : "Type your question or use the microphone above…"
                  }
                  rows={3}
                  disabled={
                    isTranscribing || (isProcessing && !isListening)
                  }
                  className={`min-h-[88px] resize-none text-base transition-colors ${
                    isListening
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : ""
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void handleTextSubmit()
                    }
                  }}
                />
                <Button
                  onClick={() => void handleTextSubmit()}
                  disabled={
                    isProcessing ||
                    isTranscribing ||
                    (!textInput.trim() && !isListening)
                  }
                  className="self-end shrink-0"
                  title="Send message"
                >
                  {isListening ? (
                    <span className="text-xs font-medium">Send</span>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {isListening && (
                <p className="text-center text-xs font-medium text-primary animate-pulse">
                  {textInput.trim()
                    ? `● Typing: “${textInput.length > 48 ? `${textInput.slice(0, 48)}…` : textInput}”`
                    : "● Listening… start speaking"}
                </p>
              )}

              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {followUps.length > 0
                    ? "Suggested follow-ups:"
                    : "Quick questions:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(followUps.length > 0 ? followUps : quickPrompts).map(
                    (prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          if (followUps.length > 0) void runTurn(prompt)
                          else setTextInput(prompt)
                        }}
                        disabled={isProcessing}
                        className="rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-muted/80 disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {conversationId && (
                <p className="text-center text-[10px] text-muted-foreground">
                  Conversation saved
                </p>
              )}
          </div>
        </div>
      </div>

      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Saved conversations</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {historyLoading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved chats yet</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={String(c._id)}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => handleLoadConversation(String(c._id))}
                  >
                    <p className="truncate font-medium">{String(c.title)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(String(c.updatedAt)), {
                        addSuffix: true,
                      })}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => remove(String(c._id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
