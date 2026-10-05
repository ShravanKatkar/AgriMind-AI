"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, Loader2, Leaf, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useSiteHelpChat } from "@/hooks/use-site-help-chat"
import {
  extractPageSnapshot,
  formatPageSnapshot,
} from "@/lib/site-help/extract-page"
import { stripAsterisks } from "@/lib/chat/clean-text"
import type { ChatMessageInput } from "@/types/ai"

type HelpMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const WELCOME =
  "Hi! I'm your AgriMind site guide. Ask me how to use this page, where to find features, or how to sign up and use AI Diagnosis, Voice, and Market tools."

const SUGGESTIONS = [
  "How do I sign up?",
  "Where is AI crop diagnosis?",
  "What can I do on this page?",
  "How does the voice assistant work?",
]

export function SiteHelpWidget() {
  const pathname = usePathname() ?? "/"
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<HelpMessage[]>([
    { id: "welcome", role: "assistant", content: WELCOME },
  ])
  const endRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { sendMessage, isLoading } = useSiteHelpChat()

  const isDashboard = pathname.startsWith("/dashboard")

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  function closeChat() {
    setOpen(false)
  }

  async function handleSend(text?: string) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isLoading) return

    const userMsg: HelpMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    const history: ChatMessageInput[] = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }))

    const snapshot = formatPageSnapshot(extractPageSnapshot(pathname))
    const reply = await sendMessage(trimmed, {
      pathname,
      pageSnapshot: snapshot,
      history,
    })

    if (reply) {
      const cleanReply = stripAsterisks(reply)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: cleanReply },
      ])
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[59] cursor-default bg-black/20 backdrop-blur-[1px]"
            aria-label="Close help chat"
            onClick={closeChat}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "fixed right-4 z-[60] flex flex-col items-end gap-3",
          isDashboard ? "bottom-20 lg:bottom-6" : "bottom-6"
        )}
        data-no-translate
      >
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            >
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15"
              >
                <Bot className="h-5 w-5" />
              </motion.div>
              <motion.div
                className="min-w-0 flex-1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="text-sm font-semibold leading-tight">
                  AgriMind Help
                </p>
                <p className="truncate text-xs text-primary-foreground/80">
                  Website guide · OpenAI
                </p>
              </motion.div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-primary-foreground hover:bg-primary-foreground/15"
                onClick={closeChat}
                aria-label="Close help chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[min(50vh,320px)]">
              <motion.div
                className="space-y-3 p-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-muted text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{stripAsterisks(msg.content)}</p>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                )}
                <motion.div ref={endRef} />
              </motion.div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              className="flex gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about this website…"
                rows={1}
                className="min-h-[40px] max-h-24 resize-none text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 shrink-0"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!open && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              size="lg"
              className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-green-500 shadow-lg shadow-primary/25 hover:from-primary hover:to-green-400"
              onClick={() => setOpen(true)}
              aria-expanded={false}
              aria-label="Open help chat"
            >
              <Leaf className="h-6 w-6" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-background" />
              </span>
            </Button>
          </motion.div>
        )}
      </div>
    </>
  )
}
