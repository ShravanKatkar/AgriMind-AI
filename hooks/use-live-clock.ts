"use client"

import { useEffect, useState } from "react"
import { formatColomboDateTime } from "@/lib/datetime/greeting"

export function useLiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return {
    now,
    ...formatColomboDateTime(now),
  }
}
