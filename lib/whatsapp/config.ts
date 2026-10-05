import { WHATSAPP_SUPPORT_NUMBER } from "@/lib/constants"

/** AgriMind officer / support WhatsApp (E.164 without +) */
const DEFAULT_SUPPORT = WHATSAPP_SUPPORT_NUMBER

export function getWhatsAppSupportNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT?.replace(/\D/g, "") ??
    process.env.WHATSAPP_SUPPORT_NUMBER?.replace(/\D/g, "") ??
    DEFAULT_SUPPORT
  return raw || DEFAULT_SUPPORT
}

export function buildWhatsAppUrl(text: string): string {
  const number = getWhatsAppSupportNumber()
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
