"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import type { ChatMessageInput } from "@/types/ai"

export function useSiteHelpChat() {
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (
      message: string,
      options: {
        pathname: string
        pageSnapshot?: string
        history?: ChatMessageInput[]
      }
    ): Promise<string | null> => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/site-help/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            pathname: options.pathname,
            pageSnapshot: options.pageSnapshot,
            history: options.history ?? [],
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error ?? "Could not get a reply")
        }
        return json.data?.reply ?? null
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Help chat unavailable"
        )
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { sendMessage, isLoading }
}
