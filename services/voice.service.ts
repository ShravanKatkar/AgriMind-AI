import { connectDB } from "@/lib/mongodb"
import VoiceConversation, {
  type IVoiceConversation,
  type IVoiceMessage,
} from "@/models/VoiceConversation"
import { generateFarmingChatReply } from "@/services/openai.service"
import { translateText } from "@/services/valsea.service"
import { stripAsterisks } from "@/lib/chat/clean-text"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

export async function listVoiceConversations(
  firebaseUid: string,
  limit = 20
): Promise<IVoiceConversation[]> {
  try {
    await connectDB()
    return VoiceConversation.find({ firebaseUid })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()
  } catch {
    return []
  }
}

export async function getVoiceConversation(
  firebaseUid: string,
  id: string
): Promise<IVoiceConversation | null> {
  try {
    await connectDB()
    return VoiceConversation.findOne({ _id: id, firebaseUid }).lean()
  } catch {
    return null
  }
}

export async function deleteVoiceConversation(
  firebaseUid: string,
  id: string
): Promise<boolean> {
  try {
    await connectDB()
    const result = await VoiceConversation.deleteOne({ _id: id, firebaseUid })
    return result.deletedCount > 0
  } catch {
    return true
  }
}

function titleFromMessage(text: string): string {
  const t = text.trim().slice(0, 48)
  return t.length < text.trim().length ? `${t}…` : t || "Voice chat"
}

async function ensureTranslatedReply(
  reply: string,
  language: SupportedLanguage
): Promise<string> {
  const clean = stripAsterisks(reply)
  if (language === "en") return clean
  try {
    const translated = await translateText(clean, language, "auto")
    return stripAsterisks(translated.translatedText?.trim() || clean)
  } catch {
    return clean
  }
}

export interface VoiceTurnResult {
  reply: string
  conversationId: string
  userMessage: IVoiceMessage
  assistantMessage: IVoiceMessage
}

export async function saveVoiceTurn(params: {
  firebaseUid: string
  language: SupportedLanguage
  conversationId?: string
  userMessage: { content: string; transcript?: string }
  assistantMessage: { content: string }
}): Promise<{ conversationId: string }> {
  try {
    await connectDB()

    const userMsg: IVoiceMessage = {
      role: "user",
      content: params.userMessage.content,
      transcript: params.userMessage.transcript,
      createdAt: new Date(),
    }
    const assistantMsg: IVoiceMessage = {
      role: "assistant",
      content: stripAsterisks(params.assistantMessage.content),
      createdAt: new Date(),
    }

    if (params.conversationId) {
      const updated = await VoiceConversation.findOneAndUpdate(
        { _id: params.conversationId, firebaseUid: params.firebaseUid },
        {
          $set: { language: params.language },
          $push: { messages: { $each: [userMsg, assistantMsg] } },
        },
        { new: true }
      ).lean()
      if (updated) return { conversationId: String(updated._id) }
    }

    const created = await VoiceConversation.create({
      firebaseUid: params.firebaseUid,
      language: params.language,
      title: titleFromMessage(params.userMessage.content),
      messages: [userMsg, assistantMsg],
    })

    return { conversationId: String(created._id) }
  } catch (err) {
    console.warn("[voice.service] DB unavailable, conversation not persisted to cloud:", (err as Error).message)
    return { conversationId: params.conversationId || "offline-session" }
  }
}

export async function processVoiceTurn(params: {
  firebaseUid: string
  message: string
  language: SupportedLanguage
  conversationId?: string
  transcript?: string
  history?: ChatMessageInput[]
}): Promise<VoiceTurnResult> {
  const history = params.history ?? []
  let reply = await generateFarmingChatReply(
    params.message,
    params.language,
    history
  )

  reply = await ensureTranslatedReply(reply, params.language)

  // Asynchronously attempt to persist to DB without failing the voice turn
  saveVoiceTurn({
    firebaseUid: params.firebaseUid,
    conversationId: params.conversationId,
    language: params.language,
    userMessage: { content: params.message, transcript: params.transcript },
    assistantMessage: { content: reply },
  }).catch(() => {})

  const userMessage: IVoiceMessage = {
    role: "user",
    content: params.message,
    transcript: params.transcript,
    createdAt: new Date(),
  }

  const assistantMessage: IVoiceMessage = {
    role: "assistant",
    content: reply,
    createdAt: new Date(),
  }

  let conversation: IVoiceConversation | null = null

  if (params.conversationId) {
    conversation = await VoiceConversation.findOneAndUpdate(
      { _id: params.conversationId, firebaseUid: params.firebaseUid },
      {
        $set: { language: params.language },
        $push: { messages: { $each: [userMessage, assistantMessage] } },
      },
      { new: true }
    ).lean()
  }

  if (!conversation) {
    conversation = await VoiceConversation.create({
      firebaseUid: params.firebaseUid,
      language: params.language,
      title: titleFromMessage(params.message),
      messages: [userMessage, assistantMessage],
    })
  }

  return {
    reply,
    conversationId: String(conversation._id),
    userMessage,
    assistantMessage,
  }
}
