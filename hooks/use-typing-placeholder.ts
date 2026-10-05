"use client"

import { useEffect, useState } from "react"

export function useTypingPlaceholder(
  phrases: string[],
  options?: { typingMs?: number; pauseMs?: number; deletingMs?: number }
) {
  const typingMs = options?.typingMs ?? 55
  const pauseMs = options?.pauseMs ?? 2200
  const deletingMs = options?.deletingMs ?? 32

  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phrases.length === 0) return

    const full = phrases[index % phrases.length]

    if (!deleting && text === full) {
      const pause = window.setTimeout(() => setDeleting(true), pauseMs)
      return () => window.clearTimeout(pause)
    }

    if (deleting && text === "") {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
      return
    }

    const delay = deleting ? deletingMs : typingMs
    const timer = window.setTimeout(() => {
      setText((prev) => {
        if (deleting) return full.slice(0, prev.length - 1)
        return full.slice(0, prev.length + 1)
      })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [text, deleting, index, phrases, typingMs, pauseMs, deletingMs])

  return text
}
