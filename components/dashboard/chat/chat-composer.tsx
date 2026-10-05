"use client"

import { Mic, Send, Loader2, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiveVoiceTextarea } from "@/components/dashboard/voice/live-voice-textarea"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  input: string
  isListening: boolean
  isTranscribing: boolean
  isPartialTranscribing: boolean
  isTyping: boolean
  isChunkedLiveTyping: boolean
  usesValseaVoice?: boolean
  voiceReplies: boolean
  placeholder: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onInputChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onMicClick: () => void
  onSend: () => void
  onVoiceRepliesToggle: () => void
}

export function ChatComposer({
  input,
  isListening,
  isTranscribing,
  isPartialTranscribing,
  isTyping,
  isChunkedLiveTyping,
  usesValseaVoice = true,
  voiceReplies,
  placeholder,
  textareaRef,
  onInputChange,
  onKeyDown,
  onMicClick,
  onSend,
  onVoiceRepliesToggle,
}: ChatComposerProps) {
  const inputDisabled = isTranscribing || (isTyping && !isListening)
  const micBusy = isTranscribing

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-end gap-2">
        <Button
          type="button"
          size="icon"
          variant={isListening ? "destructive" : "default"}
          className={cn(
            "h-12 w-12 shrink-0 rounded-full shadow-md",
            !isListening && "bg-primary hover:bg-primary/90"
          )}
          onClick={onMicClick}
          disabled={micBusy || isTyping}
          title={isListening ? "Stop and send" : "Speak your question"}
        >
          {micBusy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
          )}
        </Button>

        <LiveVoiceTextarea
          ref={textareaRef}
          value={input}
          isListening={isListening}
          animateChunked={isChunkedLiveTyping}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={inputDisabled}
          placeholder={placeholder}
          rows={2}
          className={cn(
            "min-h-[52px] max-h-[140px] resize-none rounded-xl border-muted bg-muted/40",
            isListening && "border-primary ring-2 ring-primary/25 bg-primary/5"
          )}
        />

        <Button
          type="button"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full"
          onClick={onSend}
          disabled={!input.trim() || isTyping || isListening}
          title="Send message"
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <p className="text-xs text-muted-foreground">
          {isListening
            ? isPartialTranscribing
              ? "Typing as you speak… tap red mic when done"
              : usesValseaVoice
                ? "Speak — words type here live · tap red mic when done"
                : "Speaking… tap red mic when finished"
            : "Tap green mic to speak, or type your question"}
        </p>
        <Button
          type="button"
          variant={voiceReplies ? "secondary" : "outline"}
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={onVoiceRepliesToggle}
        >
          {voiceReplies ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
          {voiceReplies ? "Voice replies on" : "Voice replies off"}
        </Button>
      </div>
    </div>
  )
}
