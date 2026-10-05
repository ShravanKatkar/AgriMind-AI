"use client"

import { useEffect, useRef, useState } from "react"

type Options = {
  /** Pixels of scroll delta before toggling visibility */
  threshold?: number
  /** Always show when scroll position is above this */
  minScroll?: number
}

/**
 * Hides chrome while scrolling down; reveals again when the user scrolls up.
 * Used for mobile date/time bars and site headers.
 */
export function useHideOnScrollDown({
  threshold = 10,
  minScroll = 40,
}: Options = {}) {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const update = () => {
      const y = window.scrollY

      if (y <= minScroll) {
        setVisible(true)
      } else if (y - lastY.current > threshold) {
        setVisible(false)
      } else if (lastY.current - y > threshold) {
        setVisible(true)
      }

      lastY.current = y
      ticking.current = false
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold, minScroll])

  return visible
}
