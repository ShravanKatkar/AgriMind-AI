"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder"

type TypingCursorLineProps = {
  phrases: string[]
  className?: string
  typingMs?: number
  pauseMs?: number
}

/** Cycles phrases with type-in / delete animation (search-bar style). */
export function TypingCursorLine({
  phrases,
  className,
  typingMs = 42,
  pauseMs = 2800,
}: TypingCursorLineProps) {
  const text = useTypingPlaceholder(phrases, { typingMs, pauseMs, deletingMs: 28 })

  if (phrases.length === 0) return null

  return (
    <p className={cn("min-h-[1.25rem]", className)}>
      <span>{text}</span>
      <motion.span
        aria-hidden
        className="inline-block w-[2px] h-[0.85em] bg-current ml-0.5 align-middle rounded-sm"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
      />
    </p>
  )
}
