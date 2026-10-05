export const APP_NAME = "AgriMind AI"
export const APP_TAGLINE = "Your AI Farming Partner From Seed To Harvest"

/** MongoDB database name used by all Mongoose models */
export const MONGODB_DATABASE_NAME = "agrimind"

export const COOKIE_NAMES = {
  session: "__agrimind_session",
  adminSession: "__agrimind_admin_session",
} as const

export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  admin: "/admin",
  adminLogin: "/admin/login",
} as const

export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export const SUPPORTED_CROPS = [
  "Rice",
  "Tea",
  "Coconut",
  "Tomato",
  "Chili",
  "Onion",
  "Banana",
  "Corn",
  "Carrot",
] as const

import { ASIAN_LANGUAGES } from "@/lib/i18n/languages"

/** @deprecated Prefer ASIAN_LANGUAGES from lib/i18n/languages */
export const LANGUAGES = ASIAN_LANGUAGES.map((l) => ({
  code: l.code,
  label: l.nativeLabel,
}))

/** Officer support WhatsApp (E.164 without +) */
export const WHATSAPP_SUPPORT_NUMBER = "94772117131"
