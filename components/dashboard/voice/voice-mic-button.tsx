"use client"

import { Mic, StopCircle, Loader2, Volume2 } from "lucide-react"
import { motion } from "framer-motion"
import { VoiceWaveAnimation } from "@/components/dashboard/voice/voice-wave-animation"

interface VoiceMicButtonProps {
  isListening: boolean
  isSpeaking?: boolean
  isProcessing: boolean
  audioLevel: number
  onClick: () => void
  size?: "default" | "large"
}

export function VoiceMicButton({
  isListening,
  isSpeaking = false,
  isProcessing,
  audioLevel,
  onClick,
  size = "default",
}: VoiceMicButtonProps) {
  const isLarge = size === "large"
  const btnClass = isLarge ? "h-28 w-28" : "h-20 w-20"
  const iconClass = isLarge ? "h-12 w-12" : "h-8 w-8"
  const showWave = isListening || isSpeaking

  return (
    <div className="flex flex-col items-center gap-4">
      {showWave && (
        <VoiceWaveAnimation
          variant={isSpeaking ? "speaking" : "listening"}
          barCount={isLarge ? 28 : 20}
          level={audioLevel}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={isProcessing && !isListening}
        className={`relative flex ${btnClass} items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-60 ${
          isListening
            ? "scale-105 bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
            : isSpeaking
              ? "scale-105 bg-primary text-primary-foreground ring-4 ring-primary/30"
              : "bg-primary text-primary-foreground hover:scale-105 ring-4 ring-primary/20"
        }`}
      >
        {isProcessing && !isListening ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : isListening ? (
          <StopCircle className={iconClass} />
        ) : isSpeaking ? (
          <Volume2 className={iconClass} />
        ) : (
          <Mic className={iconClass} />
        )}
        {isListening && (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
        )}
        {isSpeaking && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </button>
    </div>
  )
}
