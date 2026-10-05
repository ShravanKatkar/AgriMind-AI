"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export function useProfile() {
  const { refreshSession } = useAuth()
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile")
      const json = await res.json()
      if (res.ok) setProfile(json.data)
    } catch {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = async (updates: Record<string, unknown>) => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Update failed")
    setProfile(json.data)
    await refreshSession()
    toast.success("Profile updated")
    return json.data
  }

  return { profile, loading, updateProfile, refresh: fetchProfile }
}
