"use client"

import { useCallback, useEffect, useState } from "react"
import type { AdminOverviewStats } from "@/services/admin.service"

export interface AdminStatsData {
  stats: AdminOverviewStats
  signups: { date: string; signups: number }[]
  activity: { date: string; diagnoses: number; voice: number }[]
  severity: { severity: string; count: number }[]
  districts: { district: string; farmers: number }[]
}

export function useAdminStats() {
  const [data, setData] = useState<AdminStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/stats")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to load stats")
      setData(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { data, loading, error, refresh: fetchStats }
}
