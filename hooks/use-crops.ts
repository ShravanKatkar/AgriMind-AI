"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useCrops() {
  const [crops, setCrops] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCrops = useCallback(async () => {
    try {
      const res = await fetch("/api/crops")
      const json = await res.json()
      if (res.ok) setCrops(json.data ?? [])
    } catch {
      toast.error("Failed to load crops")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCrops()
  }, [fetchCrops])

  const createCrop = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/crops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to create crop")
    await fetchCrops()
    return json.data
  }

  const updateCrop = async (id: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/crops/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to update crop")
    await fetchCrops()
    return json.data
  }

  const deleteCrop = async (id: string) => {
    const res = await fetch(`/api/crops/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete crop")
    await fetchCrops()
  }

  const seedSampleCrops = async () => {
    const res = await fetch("/api/crops/seed", { method: "POST" })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to add sample crops")
    await fetchCrops()
    return json.data as { created: number; skipped: number }
  }

  return {
    crops,
    loading,
    fetchCrops,
    createCrop,
    updateCrop,
    deleteCrop,
    seedSampleCrops,
  }
}
