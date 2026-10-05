"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ChatMessageContentProps = {
  content: string
  variant?: "user" | "ai"
}

function renderLine(line: string, key: number, variant: "user" | "ai") {
  const trimmed = line.trim()
  if (!trimmed) return <br key={key} />

  const heading = trimmed.match(/^#{1,3}\s+(.+)$/)
  if (heading) {
    return (
      <p
        key={key}
        className={cn(
          "mt-3 mb-1 font-semibold",
          variant === "user" ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {heading[1]}
      </p>
    )
  }

  const numbered = trimmed.match(/^\d+\.\s+(.+)$/)
  if (numbered) {
    return (
      <p key={key} className="ml-1 flex gap-2 leading-relaxed">
        <span className="shrink-0 font-medium opacity-70">•</span>
        <span>{formatInline(numbered[1], variant)}</span>
      </p>
    )
  }

  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    return (
      <p key={key} className="ml-1 flex gap-2 leading-relaxed">
        <span className="shrink-0 opacity-70">•</span>
        <span>{formatInline(trimmed.slice(2), variant)}</span>
      </p>
    )
  }

  return (
    <p key={key} className="leading-relaxed">
      {formatInline(trimmed, variant)}
    </p>
  )
}

function formatInline(text: string, variant: "user" | "ai"): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2).replace(/\*/g, "")
      return (
        <strong
          key={i}
          className={variant === "user" ? "font-semibold" : "font-semibold text-foreground"}
        >
          {inner}
        </strong>
      )
    }
    return part.replace(/\*/g, "")
  })
}

export function ChatMessageContent({
  content,
  variant = "ai",
}: ChatMessageContentProps) {
  const lines = content.split("\n")

  return (
    <div className="space-y-0.5 text-sm">
      {lines.map((line, i) => renderLine(line, i, variant))}
    </div>
  )
}
