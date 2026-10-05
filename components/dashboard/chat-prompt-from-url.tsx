"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function ChatPromptFromUrl({
  onPrompt,
}: {
  onPrompt: (prompt: string) => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const prompt = searchParams.get("prompt")?.trim()
    if (prompt) onPrompt(prompt)
  }, [searchParams, onPrompt])

  return null
}
