import mongoose, { Schema, type Document, type Model } from "mongoose"
import { SUPPORTED_LANGUAGE_CODES } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export interface IVoiceMessage {
  role: "user" | "assistant"
  content: string
  transcript?: string
  createdAt: Date
}

export interface IVoiceConversation extends Document {
  firebaseUid: string
  language: SupportedLanguage
  title: string
  messages: IVoiceMessage[]
  createdAt: Date
  updatedAt: Date
}

const VoiceMessageSchema = new Schema<IVoiceMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    transcript: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const VoiceConversationSchema = new Schema<IVoiceConversation>(
  {
    firebaseUid: { type: String, required: true, index: true },
    language: { type: String, enum: SUPPORTED_LANGUAGE_CODES, default: "en" },
    title: { type: String, default: "Voice chat" },
    messages: { type: [VoiceMessageSchema], default: [] },
  },
  { timestamps: true }
)

VoiceConversationSchema.index({ firebaseUid: 1, updatedAt: -1 })

const VoiceConversation: Model<IVoiceConversation> =
  mongoose.models.VoiceConversation ??
  mongoose.model<IVoiceConversation>("VoiceConversation", VoiceConversationSchema)

export default VoiceConversation
