import { buildWhatsAppUrl } from "@/lib/whatsapp/config"
import type { CropDiagnosisResult } from "@/types/ai"

export function buildSupportChatUrl(message?: string): string {
  const defaultMsg =
    "Hello AgriMind AI, I need help with my farm. My name is "
  return buildWhatsAppUrl(message?.trim() || defaultMsg)
}

export function buildDiagnosisShareUrl(params: {
  cropType: string
  diagnosis: CropDiagnosisResult
  reportId?: string
}): string {
  return buildExpertConsultUrl(params)
}

/** Pre-filled WhatsApp message for agriculture officer / expert support. */
export function buildExpertConsultUrl(params: {
  cropType: string
  diagnosis: CropDiagnosisResult
  reportId?: string
}): string {
  const { diagnosis: d, cropType, reportId } = params
  const symptoms = d.symptoms.slice(0, 3).map((s) => `• ${s}`).join("\n")
  const treatment = d.treatment
    .slice(0, 3)
    .map((t) => `${t.step}. ${t.action} (${t.timing})`)
    .join("\n")

  const text = [
    "Hello AgriMind expert, I need advice on my crop.",
    "",
    `Crop: ${cropType}`,
    `Issue: ${d.disease}`,
    `Confidence: ${d.confidence}% | Severity: ${d.severity}`,
    "",
    "Symptoms:",
    symptoms || "—",
    "",
    "Current treatment plan:",
    treatment || (d.treatment[0]?.action ?? "See AgriMind app"),
    reportId ? `\nReport ID: ${reportId}` : "",
    "",
    "Please help me with the next steps. Thank you!",
  ]
    .filter((line) => line !== undefined)
    .join("\n")

  return buildWhatsAppUrl(text)
}

export function buildReminderWhatsAppUrl(params: {
  title: string
  dueDate: string
  cropName?: string
}): string {
  const text = [
    "🔔 AgriMind Reminder",
    params.title,
    params.cropName ? `Crop: ${params.cropName}` : "",
    `Due: ${params.dueDate}`,
    "",
    "I completed / need help with this task.",
  ]
    .filter(Boolean)
    .join("\n")
  return buildWhatsAppUrl(text)
}
