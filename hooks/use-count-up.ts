"use client"

import { useEffect, useState } from "react"

type UseCountUpOptions = {
  duration?: number
  /** When false, shows 0 until enabled */
  enabled?: boolean
}

export function useCountUp(
  target: number,
  { duration = 700, enabled = true }: UseCountUpOptions = {}
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setValue(0)
      return
    }

    if (target <= 0) {
      setValue(0)
      return
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, enabled])

  return value
}

export function parseStatNumber(raw: string): number | null {
  const match = raw.replace(/,/g, "").match(/\d+/)
  if (!match) return null
  const n = Number.parseInt(match[0], 10)
  return Number.isFinite(n) ? n : null
}
