"use client"

import { forwardRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useTypewriterText } from "@/hooks/use-typewriter-text"
import { cn } from "@/lib/utils"

type LiveVoiceTextareaProps = React.ComponentProps<typeof Textarea> & {
  value: string
  isListening: boolean
  /** Typewriter animation for chunked API updates */
  animateChunked?: boolean
}

export const LiveVoiceTextarea = forwardRef<
  HTMLTextAreaElement,
  LiveVoiceTextareaProps
>(function LiveVoiceTextarea(
  {
    value,
    isListening,
    animateChunked = false,
    className,
    placeholder,
    onChange,
    ...props
  },
  ref
) {
  const animated = useTypewriterText(value, isListening && animateChunked)
  const show = isListening && animateChunked ? animated : value
  const showCaret = isListening

  useEffect(() => {
    if (!isListening || !ref || typeof ref === "function") return
    const el = ref && "current" in ref ? ref.current : null
    if (el) el.scrollTop = el.scrollHeight
  }, [show, isListening, ref])

  return (
    <div className="relative min-w-0 flex-1">
      <Textarea
        ref={ref}
        value={show}
        onChange={onChange}
        placeholder={isListening ? "" : placeholder}
        className={cn(
          className,
          showCaret && "caret-primary",
          isListening && "pr-2"
        )}
        {...props}
      />
      {showCaret && (
        <span
          className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium text-primary animate-pulse"
          aria-hidden
        >
          ● listening
        </span>
      )}
    </div>
  )
})
