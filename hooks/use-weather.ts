"use client"

import { useCallback, useEffect, useState } from "react"

const AUTO_REFRESH_MS = 15 * 60 * 1000 // 15 minutes

export function useWeather(locationId: string) {
  const [weather, setWeather] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWeather = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/weather?location=${locationId}`, {
        cache: "no-store",
      })
      const json = await res.json()
      if (res.ok) setWeather(json.data)
      else setWeather(null)
    } catch {
      setWeather(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [locationId])

  useEffect(() => {
    void fetchWeather()
  }, [fetchWeather])

  useEffect(() => {
    const id = window.setInterval(() => {
      void fetchWeather(true)
    }, AUTO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [fetchWeather])

  return {
    weather,
    loading,
    refreshing,
    refresh: () => fetchWeather(true),
  }
}
