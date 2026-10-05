"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type ChatVoiceSettingsProps = {
  voiceReplies: boolean
  onVoiceRepliesChange: (value: boolean) => void
  autoSendVoice: boolean
  onAutoSendVoiceChange: (value: boolean) => void
  disabled?: boolean
}

export function ChatVoiceSettings({
  voiceReplies,
  onVoiceRepliesChange,
  autoSendVoice,
  onAutoSendVoiceChange,
  disabled,
}: ChatVoiceSettingsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
      data-no-translate
    >
      <div className="flex items-center gap-2">
        <Switch
          id="chat-voice-replies"
          checked={voiceReplies}
          onCheckedChange={onVoiceRepliesChange}
          disabled={disabled}
        />
        <Label htmlFor="chat-voice-replies" className="cursor-pointer text-xs">
          AI voice replies
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="chat-auto-send-voice"
          checked={autoSendVoice}
          onCheckedChange={onAutoSendVoiceChange}
          disabled={disabled}
        />
        <Label htmlFor="chat-auto-send-voice" className="cursor-pointer text-xs">
          Send when mic stops
        </Label>
      </div>
    </div>
  )
}
