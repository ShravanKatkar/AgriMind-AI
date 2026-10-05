import { getAsianLanguage } from "@/lib/i18n/languages"
import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import { assertOpenAIConfigured } from "@/lib/openai/config"
import type { SupportedLanguage } from "@/types"

const BATCH_SIZE = 18

function languageLabel(code: SupportedLanguage | "auto"): string {
  if (code === "auto" || code === "en") return "English"
  const lang = getAsianLanguage(code)
  if (!lang) return code
  return `${lang.label} (${lang.nativeLabel})`
}

function parseTranslationsJson(raw: string, expected: number): string[] | null {
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim()
    const parsed = JSON.parse(cleaned) as { translations?: unknown } | unknown[]
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.translations)
        ? parsed.translations
        : null
    if (!list || list.length !== expected) return null
    return list.map((item) => String(item ?? "").trim())
  } catch {
    return null
  }
}

/** OpenAI translation for target languages (Hindi, Marathi, English). */
export async function translateTextsWithOpenAI(
  texts: string[],
  target: SupportedLanguage,
  source: SupportedLanguage | "auto" = "en"
): Promise<string[]> {
  assertOpenAIConfigured()
  const openai = getOpenAIClient()
  const targetName = languageLabel(target)
  const sourceName = languageLabel(source)
  const out = [...texts]

  for (let start = 0; start < texts.length; start += BATCH_SIZE) {
    const chunk = texts.slice(start, start + BATCH_SIZE)
    const lines = chunk
      .map((text, index) => `${index + 1}. ${text.trim()}`)
      .join("\n")

    const completion = await openai.chat.completions.create({
      model: openaiConfig.chatModel,
      messages: [
        {
          role: "system",
          content: `You translate UI text for AgriMind AI, a farming app. Translate each numbered line from ${sourceName} to ${targetName}. Keep product name "AgriMind AI" unchanged. Return JSON only: {"translations":["line1","line2",...]} with exactly ${chunk.length} strings in order.`,
        },
        { role: "user", content: lines },
      ],
      max_tokens: 4096,
      temperature: 0.2,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      throw new Error(`Groq returned no translation for ${targetName}.`)
    }

    const translated = parseTranslationsJson(raw, chunk.length)
    if (!translated) {
      throw new Error(`Could not parse ${targetName} translation from Groq.`)
    }

    translated.forEach((value, index) => {
      out[start + index] = value || chunk[index]
    })
  }

  return out
}

export async function translateTextWithOpenAI(
  text: string,
  target: SupportedLanguage,
  source: SupportedLanguage | "auto" = "en"
): Promise<string> {
  const [translated] = await translateTextsWithOpenAI([text], target, source)
  return translated
}
