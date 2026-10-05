"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTypewriter } from "@/hooks/use-typewriter"

type TypingTextProps = {
  text: string
  className?: string
  speedMs?: number
  startDelayMs?: number
  showCursor?: boolean
  onComplete?: () => void
}

export function TypingText({
  text,
  className,
  speedMs,
  startDelayMs,
  showCursor = true,
  onComplete,
}: TypingTextProps) {
  const { displayed, done } = useTypewriter(text, { speedMs, startDelayMs })

  useEffect(() => {
    if (done) onComplete?.()
  }, [done, onComplete])

  return (
    <span className={cn("inline", className)} aria-label={text}>
      <span>{displayed}</span>
      {showCursor && !done && (
        <motion.span
          aria-hidden
          className="inline-block w-[2px] h-[0.9em] bg-current ml-0.5 align-middle rounded-sm"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </span>
  )
}
