import {
  valseaTranscribe,
  type TranscribeResult,
  type TranslateResult,
} from "@/lib/valsea/client"
import { toValseaLanguageName } from "@/lib/i18n/languages"
import { toValseaTranslateSource } from "@/lib/valsea/translate-languages"
import { translateTextWithOpenAI } from "@/services/openai-translate.service"
import { getFarmingAssistantReply } from "@/services/ai.service"
import type { SupportedLanguage } from "@/types"

import { isValseaConfigured } from "@/lib/valsea/config"
import { getOpenAIClient } from "@/lib/openai/client"

export function toValseaLanguage(code: SupportedLanguage | string): string {
  return toValseaLanguageName(code)
}

/** Voice audio → text (Groq Whisper free fallback, or Valsea if configured). */
export async function transcribeAudio(
  file: Blob,
  language: SupportedLanguage | "auto",
  filename?: string
): Promise<TranscribeResult> {
  if (isValseaConfigured()) {
    try {
      return await valseaTranscribe({
        file,
        filename,
        language:
          language === "auto" ? undefined : toValseaLanguage(language),
      })
    } catch (e) {
      console.warn("Valsea transcription failed, falling back to Groq Whisper:", e)
    }
  }

  const openai = getOpenAIClient()
  const audioFile = new File([file], filename ?? "audio.webm", {
    type: file.type || "audio/webm",
  })

  const whisperRes = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3",
    language: language === "auto" ? undefined : language,
  })

  return {
    text: whisperRes.text || "",
    rawTranscript: whisperRes.text || "",
  }
}

/**
 * Text translation — OpenAI by default so Valsea quota stays for voice.
 */
export async function translateText(
  text: string,
  target: SupportedLanguage,
  source?: SupportedLanguage | "auto"
): Promise<TranslateResult> {
  if (target === "en" && (!source || source === "en" || source === "auto")) {
    return {
      translatedText: text,
      sourceLanguage: "english",
      targetLanguage: "english",
    }
  }

  const translatedText = await translateTextWithOpenAI(
    text,
    target,
    source ?? "en"
  )
  return {
    translatedText,
    sourceLanguage: toValseaTranslateSource(source ?? "en"),
    targetLanguage: toValseaLanguageName(target),
  }
}

/** Voice/text assist — OpenAI chat + OpenAI translation (no Valsea translate). */
export async function getMultilingualFarmingReply(
  userMessage: string,
  language: SupportedLanguage,
  history?: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; replyEnglish: string }> {
  let query = userMessage.trim()

  if (language !== "en") {
    try {
      const toEnglish = await translateText(query, "en", language)
      if (toEnglish.translatedText?.trim()) {
        query = toEnglish.translatedText.trim()
      }
    } catch {
      /* use original message */
    }
  }

  const { reply: englishReply } = await getFarmingAssistantReply(
    query,
    "en",
    history
  )

  if (language === "en") {
    return { reply: englishReply, replyEnglish: englishReply }
  }

  try {
    const localized = await translateText(englishReply, language, "en")
    const reply = localized.translatedText?.trim() || englishReply
    return { reply, replyEnglish: englishReply }
  } catch {
    const direct = await getFarmingAssistantReply(
      userMessage,
      language,
      history
    )
    return { reply: direct.reply, replyEnglish: englishReply }
  }
}
