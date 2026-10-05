"use client"

import { useEffect, useState } from "react"

/** Reveals new characters when `target` grows (chunked voice updates). */
export function useTypewriterText(target: string, enabled: boolean) {
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    if (!enabled) {
      setDisplay(target)
      return
    }

    if (target.length <= display.length && target !== display) {
      setDisplay(target)
    }
  }, [target, enabled, display])

  useEffect(() => {
    if (!enabled || display === target) return

    const timer = window.setInterval(() => {
      setDisplay((prev) => {
        if (prev.length >= target.length) return target
        return target.slice(0, prev.length + 2)
      })
    }, 28)

    return () => window.clearInterval(timer)
  }, [target, enabled, display, target.length])

  return enabled ? display : target
}
