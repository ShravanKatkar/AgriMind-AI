"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MARKET_AUTO_REFRESH_MS } from "@/lib/market/constants"

export interface MarketCropPrice {
  name: string
  nameSi?: string
  price: number
  unit: string
  change: number
  changePercent: number
  trend: "up" | "down" | "stable"
  location: string
  forecast?: string
  demandLevel: "high" | "medium" | "low"
  market?: string
  priceSource?: "seed" | "ai_estimate"
  dataAsOf?: string
}

export interface MarketLocation {
  name: string
  demand: string
  crops: string[]
}

export interface MarketInsight {
  title: string
  description: string
  type: "opportunity" | "warning" | "info"
}

export interface MarketAlert {
  _id: string
  cropName: string
  condition: "above" | "below"
  targetPrice: number
  active: boolean
}

export function useMarket() {
  const [prices, setPrices] = useState<MarketCropPrice[]>([])
  const [locations, setLocations] = useState<MarketLocation[]>([])
  const [chartData, setChartData] = useState<Record<string, string | number>[]>([])
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [alerts, setAlerts] = useState<MarketAlert[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceSource, setPriceSource] = useState<"seed" | "ai_estimate">("seed")
  const [dataAsOf, setDataAsOf] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [openAiConfigured, setOpenAiConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const autoRefreshed = useRef(false)

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch("/api/market")
      const json = await res.json()
      if (res.ok && json.data) {
        setPrices(json.data.prices ?? [])
        setLocations(json.data.locations ?? [])
        setChartData(json.data.chartData ?? [])
        setLastUpdated(
          json.data.lastUpdated ? new Date(json.data.lastUpdated) : new Date()
        )
        setPriceSource(json.data.priceSource ?? "seed")
        setDataAsOf(json.data.dataAsOf ?? null)
        setStale(Boolean(json.data.stale))
        setOpenAiConfigured(Boolean(json.data.openAiConfigured))
        return json.data as {
          stale?: boolean
          openAiConfigured?: boolean
          priceSource?: string
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
    return null
  }, [])

  const refreshPrices = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/market/refresh", { method: "POST" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Refresh failed")
      }
      await fetchMarket()
      setInsightsLoading(true)
      try {
        const ins = await fetch("/api/market/insights")
        const insJson = await ins.json()
        if (ins.ok) setInsights(insJson.data ?? [])
      } finally {
        setInsightsLoading(false)
      }
      return json.data as { updated: number; asOf: string; disclaimer?: string }
    } finally {
      setRefreshing(false)
    }
  }, [fetchMarket])

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true)
    try {
      const res = await fetch("/api/market/insights")
      const json = await res.json()
      if (res.ok) setInsights(json.data ?? [])
    } catch {
      // silent
    } finally {
      setInsightsLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/market/alerts")
      const json = await res.json()
      if (res.ok) setAlerts(json.data ?? [])
    } catch {
      // silent
    }
  }, [])

  const createAlert = async (input: {
    cropName: string
    condition: "above" | "below"
    targetPrice: number
  }) => {
    const res = await fetch("/api/market/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to create alert")
    await fetchAlerts()
    return json.data
  }

  useEffect(() => {
    void (async () => {
      const data = await fetchMarket()
      void fetchInsights()
      void fetchAlerts()

      if (
        data?.stale &&
        data?.openAiConfigured &&
        !autoRefreshed.current
      ) {
        autoRefreshed.current = true
        setRefreshing(true)
        try {
          const res = await fetch("/api/market/refresh", { method: "POST" })
          if (res.ok) {
            await fetchMarket()
            await fetchInsights()
          }
        } catch {
          /* user can click Refresh manually */
        } finally {
          setRefreshing(false)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!openAiConfigured) return
    const id = window.setInterval(() => {
      void (async () => {
        try {
          const check = await fetch("/api/market")
          const checkJson = await check.json()
          if (checkJson.data?.stale) {
            await fetch("/api/market/refresh", { method: "POST" })
          }
          await fetchMarket()
          const ins = await fetch("/api/market/insights")
          const insJson = await ins.json()
          if (ins.ok) setInsights(insJson.data ?? [])
        } catch {
          await fetchMarket()
        }
      })()
    }, MARKET_AUTO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [openAiConfigured, fetchMarket])

  return {
    prices,
    locations,
    chartData,
    insights,
    alerts,
    lastUpdated,
    priceSource,
    dataAsOf,
    stale,
    openAiConfigured,
    loading,
    insightsLoading,
    refreshing,
    createAlert,
    refresh: fetchMarket,
    refreshPrices,
  }
}
