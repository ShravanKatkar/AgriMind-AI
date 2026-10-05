"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useVoiceConversations() {
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/voice/conversations")
      const json = await res.json()
      if (res.ok) setConversations(json.data ?? [])
    } catch {
      toast.error("Failed to load voice history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const remove = async (id: string) => {
    const res = await fetch(`/api/voice/conversations/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to delete")
      return
    }
    await fetchList()
    toast.success("Conversation deleted")
  }

  return { conversations, loading, refresh: fetchList, remove }
}
