export type { SupportedLanguage } from "@/lib/i18n/languages"

export type UserRole = "farmer" | "admin" | "officer"

export interface SessionUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  preferredLanguage?: import("@/lib/i18n/languages").SupportedLanguage
  district?: string
  phone?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type { CropDiagnosisResult, ChatMessageInput } from "./ai"
