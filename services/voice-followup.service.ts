import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import { getAsianLanguage } from "@/lib/i18n/languages"
import { stripAsterisks } from "@/lib/chat/clean-text"
import type { SupportedLanguage } from "@/types"

export async function generateVoiceFollowUps(
  assistantReply: string,
  language: SupportedLanguage
): Promise<string[]> {
  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: openaiConfig.chatModel,
    temperature: 0.8,
    max_tokens: 200,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You suggest 3 short follow-up questions an Indian farmer might ask next.
Return JSON: { "questions": ["q1", "q2", "q3"] }
Write questions in ${getAsianLanguage(language)?.label ?? "English"}. Each under 80 characters. Farming-related only.`,
      },
      {
        role: "user",
        content: `Last AI reply:\n${assistantReply.slice(0, 800)}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as { questions?: string[] }
    return (parsed.questions ?? []).filter((q) => q.trim()).map(stripAsterisks).slice(0, 3)
  } catch {
    return []
  }
}
