import {
  generateFarmingChatReply,
  streamFarmingChatReply,
  analyzeCropImage,
} from "@/services/openai.service"
import type { ChatMessageInput, CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

/** Central AI orchestration — intelligence via OpenAI */
export async function getFarmingAssistantReply(
  message: string,
  language: SupportedLanguage,
  history?: ChatMessageInput[]
): Promise<{ reply: string; replyEnglish?: string }> {
  const reply = await generateFarmingChatReply(message, language, history)
  return { reply }
}

export function streamFarmingAssistantReply(
  message: string,
  language: SupportedLanguage,
  history?: ChatMessageInput[]
) {
  return streamFarmingChatReply(message, language, history)
}

export async function diagnoseCrop(params: {
  imageBase64: string
  imageUrl?: string
  cropType: string
  description?: string
  language: SupportedLanguage
}): Promise<CropDiagnosisResult> {
  return analyzeCropImage(params)
}
