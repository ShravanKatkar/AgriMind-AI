"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type VoiceWaveAnimationProps = {
  /** listening = mic input, speaking = AI voice playback */
  variant?: "listening" | "speaking"
  barCount?: number
  className?: string
  /** 0–100 optional level boost for listening mode */
  level?: number
  /** compact = landing language cards */
  size?: "default" | "compact"
}

export function VoiceWaveAnimation({
  variant = "speaking",
  barCount = 28,
  className,
  level = 50,
  size = "default",
}: VoiceWaveAnimationProps) {
  const isSpeaking = variant === "speaking"
  const isCompact = size === "compact"
  const barColor = isSpeaking
    ? isCompact
      ? "bg-primary/70"
      : "bg-primary"
    : "bg-destructive"

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isCompact ? "h-8 gap-0.5" : "gap-[3px]",
        !isCompact && (isSpeaking ? "h-16" : "h-12"),
        className
      )}
      role="img"
      aria-label={isSpeaking ? "AI voice playing" : "Listening to your voice"}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const center = barCount / 2
        const dist = Math.abs(i - center) / center
        const baseMax = isCompact ? 20 : isSpeaking ? 48 : 32
        const minH = isCompact ? 6 : isSpeaking ? 6 : 4
        const maxH =
          baseMax * (1 - dist * 0.45) + (isSpeaking ? 0 : (level % 30))

        return (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full",
              !isCompact && "sm:w-1.5",
              barColor
            )}
            animate={{
              height: isSpeaking
                ? [minH, maxH, minH + 4, maxH * 0.85, minH]
                : [minH, maxH * 0.6 + (level % 20), minH],
            }}
            transition={{
              duration: isSpeaking ? 0.55 + (i % 5) * 0.08 : 0.45,
              repeat: Infinity,
              delay: i * (isSpeaking ? 0.04 : 0.05),
              ease: "easeInOut",
            }}
          />
        )
      })}
    </div>
  )
}
