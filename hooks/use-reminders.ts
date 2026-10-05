"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useReminders(includeCompleted = false) {
  const [reminders, setReminders] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reminders${includeCompleted ? "?completed=true" : ""}`
      )
      const json = await res.json()
      if (res.ok) setReminders(json.data ?? [])
    } catch {
      toast.error("Failed to load reminders")
    } finally {
      setLoading(false)
    }
  }, [includeCompleted])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const createReminder = async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Failed to create reminder")
    await fetchReminders()
    return json.data
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
    await fetchReminders()
  }

  const removeReminder = async (id: string) => {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" })
    await fetchReminders()
  }

  return {
    reminders,
    loading,
    fetchReminders,
    createReminder,
    toggleComplete,
    removeReminder,
  }
}
