"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { useCountUp } from "@/hooks/use-count-up"
import { cn } from "@/lib/utils"

type AnimatedCounterProps = {
  value: number
  className?: string
  duration?: number
  /** Render prefix/suffix around the animated digits (e.g. "28°C") */
  format?: (n: number) => string
}

export function AnimatedCounter({
  value,
  className,
  duration = 650,
  format,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const animated = useCountUp(value, { duration, enabled: inView })

  const text = format ? format(animated) : String(animated)

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {text}
    </span>
  )
}

type AnimatedStatValueProps = {
  display: string
  className?: string
}

/** Animates pure numbers; leaves text like "—" or "28°C" as static with quick fade-in */
export function AnimatedStatValue({ display, className }: AnimatedStatValueProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const match = display.replace(/,/g, "").match(/^(\D*)(\d+)(\D*)$/)

  if (!match) {
    return (
      <span ref={ref} className={cn("tabular-nums", className)}>
        {display}
      </span>
    )
  }

  const [, prefix, numStr, suffix] = match
  const target = Number.parseInt(numStr, 10)
  const animated = useCountUp(target, { duration: 600, enabled: inView })

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {animated}
      {suffix}
    </span>
  )
}
