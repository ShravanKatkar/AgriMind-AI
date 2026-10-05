"use client"

import { Volume2, Copy, Check, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface VoiceMessageActionsProps {
  content: string
  onSpeak: () => void
  onStop?: () => void
  isSpeaking?: boolean
}

export function VoiceMessageActions({
  content,
  onSpeak,
  onStop,
  isSpeaking,
}: VoiceMessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success("Copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {isSpeaking ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 border-red-500/40 bg-red-500/10 px-2 text-xs text-red-600 hover:bg-red-500/20 dark:text-red-400"
          onClick={onStop}
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          Stop
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={onSpeak}
        >
          <Volume2 className="h-3.5 w-3.5" />
          Listen
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        Copy
      </Button>
    </div>
  )
}
