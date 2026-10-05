"use client"

import { motion } from "framer-motion"
import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { ChatPromptFromUrl } from "@/components/dashboard/chat-prompt-from-url"
import { ChatComposer } from "@/components/dashboard/chat/chat-composer"
import { ChatMessageContent } from "@/components/dashboard/chat/chat-message-content"
import { VoiceMessageActions } from "@/components/dashboard/voice/voice-message-actions"
import {
  Sparkles,
  MoreVertical,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  Square,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AsianLanguageSelect } from "@/components/i18n/asian-language-select"
import { AUTO_DETECT_LANGUAGE } from "@/lib/i18n/languages"
import { detectUserLanguage } from "@/lib/voice/detect-language"
import { useAiChat } from "@/hooks/use-ai-chat"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { textForSpeech } from "@/lib/chat/format-message"
import { getChatWelcomeMessage } from "@/lib/chat/welcome"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import { prefetchSpeech, preloadVoices, speakText, stopSpeaking } from "@/lib/voice/tts"
import { toast } from "sonner"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  status?: "sending" | "sent" | "error"
  fromVoice?: boolean
}

function buildWelcomeMessage(language: SupportedLanguage): Message {
  return {
    id: "welcome",
    type: "ai",
    content: getChatWelcomeMessage(language),
    timestamp: new Date(),
  }
}

const suggestedQuestions = [
  "How do I treat yellow leaves on tomatoes?",
  "When is the best time to plant rice?",
  "What fertilizer should I use for chili?",
  "How to prevent coconut beetle attack?",
]

export default function ChatPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en")
  const [messages, setMessages] = useState<Message[]>(() => [
    buildWelcomeMessage("en"),
  ])
  const [input, setInput] = useState("")
  const [voiceReplies, setVoiceReplies] = useState(true)
  const [autoSendVoice, setAutoSendVoice] = useState(true)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef(input)
  const cancelSpeakRef = useRef<(() => void) | null>(null)
  const voiceRepliesRef = useRef(voiceReplies)

  useEffect(() => {
    inputRef.current = input
  }, [input])

  const { sendMessage, isLoading: isTyping } = useAiChat(language)
  const {
    isListening,
    isTranscribing,
    isPartialTranscribing,
    isChunkedLiveTyping,
    usesValseaVoice,
    startListening,
    stopListening,
  } = useVoiceInput(AUTO_DETECT_LANGUAGE, {
    preferValsea: true,
    fasterLiveUpdates: true,
  })

  useEffect(() => {
    voiceRepliesRef.current = voiceReplies
  }, [voiceReplies])

  const applySearchPrompt = useCallback((prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }, [])

  const stopVoiceReply = useCallback(() => {
    cancelSpeakRef.current?.()
    stopSpeaking()
    setSpeakingMessageId(null)
  }, [])

  const speakMessage = useCallback(
    (messageId: string, text: string) => {
      const speechText = textForSpeech(text)
      if (!speechText) {
        toast.error("Nothing to read aloud for this message.")
        return
      }
      stopVoiceReply()
      cancelSpeakRef.current = speakText(speechText, language, {
        onStart: () => setSpeakingMessageId(messageId),
        onEnd: () => setSpeakingMessageId(null),
        onError: () => {
          setSpeakingMessageId(null)
          toast.error(
            "Could not play voice. Check your connection and tap Listen again."
          )
        },
      })
    },
    [language, stopVoiceReply]
  )

  useEffect(() => {
    preloadVoices()
  }, [])

  useEffect(() => {
    return () => stopVoiceReply()
  }, [stopVoiceReply])

  const handleLanguageChange = (code: SupportedLanguage) => {
    stopVoiceReply()
    setLanguage(code)
    setMessages([buildWelcomeMessage(code)])
    setInput("")
  }

  const submitMessage = useCallback(
    async (userText: string, options?: { fromVoice?: boolean }) => {
      const trimmed = userText.trim()
      if (!trimmed || isTyping) return

      stopVoiceReply()

      let replyLang = language
      if (options?.fromVoice) {
        const detected = await detectUserLanguage(trimmed)
        if (detected !== language) {
          await setLanguage(detected)
        }
        replyLang = detected
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: trimmed,
        timestamp: new Date(),
        status: "sent",
        fromVoice: options?.fromVoice,
      }

      setMessages((prev) => {
        const history: ChatMessageInput[] = [...prev, userMessage].map((m) => ({
          role: m.type === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        }))

        void (async () => {
          const reply = await sendMessage(trimmed, history, replyLang)
          if (!reply) return

          const aiId = (Date.now() + 1).toString()
          const aiMessage: Message = {
            id: aiId,
            type: "ai",
            content: reply,
            timestamp: new Date(),
          }

          setMessages((current) => [...current, aiMessage])

          if (voiceRepliesRef.current) {
            const speechText = textForSpeech(reply)
            prefetchSpeech(speechText, replyLang)
            speakMessage(aiId, reply)
          }
        })()

        return [...prev, userMessage]
      })

      setInput("")
    },
    [isTyping, language, setLanguage, sendMessage, speakMessage, stopVoiceReply]
  )

  const handleMicClick = async () => {
    if (isTyping) return
    if (speakingMessageId) stopVoiceReply()

    if (isListening) {
      const { text, errorShown } = await stopListening()
      const finalText = (text ?? inputRef.current).trim()
      setInput(finalText)

      if (!finalText && !errorShown) {
        toast.error(
          `No speech heard. Speak in ${getLanguageDisplayLabel(language)}, keep the mic on 2+ seconds, then tap the red mic.`
        )
        return
      }

      if (finalText) {
        if (autoSendVoice) {
          await submitMessage(finalText, { fromVoice: true })
        } else {
          toast.message("Ready to send — review your message and tap Send", {
            duration: 3000,
          })
          textareaRef.current?.focus()
        }
      }
      return
    }

    const started = await startListening({
      initialText: input,
      onTextChange: setInput,
    })
    if (!started) return
    textareaRef.current?.focus()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => void submitMessage(input)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    textareaRef.current?.focus()
  }

  const clearChat = () => {
    stopVoiceReply()
    setMessages([buildWelcomeMessage(language)])
  }

  const inputPlaceholder =
    isTranscribing
      ? "Finishing your speech…"
      : isPartialTranscribing
        ? "Typing as you speak…"
        : isListening
          ? "Speak now — words appear here in real time…"
          : language === "en"
            ? "Ask about crops, weather, pests, or fertilizers…"
            : `Ask in ${getLanguageDisplayLabel(language)}…`

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col">
      <Suspense fallback={null}>
        <ChatPromptFromUrl onPrompt={applySearchPrompt} />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <motion.div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Farming help</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
          <p className="text-sm text-muted-foreground">
            Type or speak — get clear answers in text and voice
          </p>
        </motion.div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <AsianLanguageSelect
            value={language}
            onChange={handleLanguageChange}
            disabled={isTyping || isListening}
            headerSubtitle="Chat language"
          />
          {speakingMessageId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 border-red-500/40 text-red-600 dark:text-red-400"
              onClick={stopVoiceReply}
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chat options">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearChat}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/80 shadow-sm">
        <CardContent className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "border border-border/60 bg-card rounded-tl-sm"
                }`}
              >
                {message.type === "ai" && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-primary">AgriMind</span>
                  </div>
                )}
                {message.type === "user" ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-foreground">
                    {message.content}
                  </p>
                ) : (
                  <ChatMessageContent content={message.content} variant="ai" />
                )}
                {message.type === "ai" && (
                  <VoiceMessageActions
                    content={message.content}
                    isSpeaking={speakingMessageId === message.id}
                    onSpeak={() => speakMessage(message.id, message.content)}
                    onStop={stopVoiceReply}
                  />
                )}
                <div
                  className={`mt-2 flex items-center gap-1 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Clock
                    className={`h-3 w-3 ${
                      message.type === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      message.type === "user"
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.type === "user" && message.status === "sent" && (
                    <CheckCircle className="ml-1 h-3 w-3 text-primary-foreground/60" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "AgriMind is thinking…"
                      : `Replying in ${getLanguageDisplayLabel(language)}…`}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {messages.length <= 2 && (
          <div className="border-t border-border/60 bg-card px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestionClick(question)}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-end">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border accent-primary"
                checked={autoSendVoice}
                onChange={(e) => setAutoSendVoice(e.target.checked)}
                disabled={isTyping || isListening}
              />
              Send when I stop speaking
            </label>
          </div>
          <ChatComposer
            input={input}
            isListening={isListening}
            isTranscribing={isTranscribing}
            isPartialTranscribing={isPartialTranscribing}
            isTyping={isTyping}
            isChunkedLiveTyping={isChunkedLiveTyping}
            usesValseaVoice={usesValseaVoice}
            voiceReplies={voiceReplies}
            placeholder={inputPlaceholder}
            textareaRef={textareaRef}
            onInputChange={setInput}
            onKeyDown={handleKeyDown}
            onMicClick={() => void handleMicClick()}
            onSend={() => void handleSend()}
            onVoiceRepliesToggle={() => setVoiceReplies((v) => !v)}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            AgriMind can make mistakes. Check important advice with a local
            agriculture officer.
          </p>
        </div>
      </Card>
    </div>
  )
}
