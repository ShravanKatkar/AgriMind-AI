import OpenAI from "openai"

import { buildSiteKnowledgeContext } from "@/lib/site-help/knowledge"
import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import { getSiteHelpSystemPrompt } from "@/lib/openai/prompts"
import { stripAsterisks } from "@/lib/chat/clean-text"
import type { ChatMessageInput } from "@/types/ai"

export async function generateSiteHelpReply(params: {
  message: string
  pathname: string
  pageSnapshot?: string
  history?: ChatMessageInput[]
}): Promise<string> {
  const openai = getOpenAIClient()

  const siteContext = buildSiteKnowledgeContext(params.pathname)
  const snapshotBlock = params.pageSnapshot
    ? `\n\nLive page snapshot (from user's browser):\n${params.pageSnapshot}`
    : ""

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: getSiteHelpSystemPrompt(siteContext + snapshotBlock),
    },
    ...(params.history ?? []).slice(-8).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: params.message },
  ]

  const completion = await openai.chat.completions.create({
    model: openaiConfig.chatModel,
    messages,
    max_tokens: 800,
    temperature: 0.5,
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) {
    throw new Error("Groq returned an empty response")
  }
  return stripAsterisks(reply)
}
