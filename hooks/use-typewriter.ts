"use client"

import { useEffect, useState } from "react"

export function useTypewriter(
  text: string,
  options?: {
    speedMs?: number
    startDelayMs?: number
    enabled?: boolean
  }
) {
  const speedMs = options?.speedMs ?? 42
  const startDelayMs = options?.startDelayMs ?? 180
  const enabled = options?.enabled !== false

  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed("")
    setDone(false)

    let intervalId: number | ReturnType<typeof setInterval> | undefined
    let index = 0

    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))
        if (index >= text.length) {
          if (intervalId) window.clearInterval(intervalId)
          setDone(true)
        }
      }, speedMs)
    }, startDelayMs)

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, speedMs, startDelayMs, enabled])

  return { displayed, done }
}
