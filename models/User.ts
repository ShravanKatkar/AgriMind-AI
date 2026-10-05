import mongoose, { Schema, type Document, type Model } from "mongoose"
import { SUPPORTED_LANGUAGE_CODES } from "@/lib/i18n/languages"
import type { UserRole, SupportedLanguage } from "@/types"

export interface IUser extends Document {
  firebaseUid: string
  email: string
  displayName: string
  photoURL?: string
  phone?: string
  role: UserRole
  preferredLanguage: SupportedLanguage
  district?: string
  farmSize?: string
  primaryCrops: string[]
  notificationPreferences?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    push: boolean
  }
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: String,
    phone: String,
    role: {
      type: String,
      enum: ["farmer", "admin", "officer"],
      default: "farmer",
    },
    preferredLanguage: {
      type: String,
      enum: SUPPORTED_LANGUAGE_CODES,
      default: "en",
    },
    district: String,
    farmSize: String,
    primaryCrops: {
      type: [String],
      default: [],
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)

export default User
