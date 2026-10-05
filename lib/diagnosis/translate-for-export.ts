import type { CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"
import { translateTextsWithOpenAI } from "@/services/openai-translate.service"

export function collectDiagnosisTexts(d: CropDiagnosisResult): string[] {
  const texts: string[] = [
    d.disease,
    d.cause,
    d.rejectionReason ?? "",
    d.estimatedRecovery,
    d.costEstimate,
    d.recoverySummary ?? "",
    d.irrigationNotes ?? "",
    d.followUpAdvice ?? "",
    ...d.symptoms,
    ...d.prevention,
    ...(d.nutrients ?? []),
    ...(d.pests ?? []),
    ...d.treatment.flatMap((t) => [t.action, t.timing, t.details ?? ""]),
    ...(d.youtubeVideos ?? []).map((v) => v.title),
  ]
  return texts.filter(Boolean)
}

export function applyDiagnosisTranslations(
  source: CropDiagnosisResult,
  originals: string[],
  translated: string[]
): CropDiagnosisResult {
  const map = new Map<string, string>()
  originals.forEach((orig, i) => {
    if (orig && translated[i]) map.set(orig, translated[i])
  })
  const tr = (s: string) => map.get(s) ?? s

  return {
    ...source,
    disease: tr(source.disease),
    cause: tr(source.cause),
    rejectionReason: source.rejectionReason
      ? tr(source.rejectionReason)
      : undefined,
    estimatedRecovery: tr(source.estimatedRecovery),
    costEstimate: tr(source.costEstimate),
    recoverySummary: source.recoverySummary
      ? tr(source.recoverySummary)
      : undefined,
    irrigationNotes: source.irrigationNotes
      ? tr(source.irrigationNotes)
      : undefined,
    followUpAdvice: source.followUpAdvice
      ? tr(source.followUpAdvice)
      : undefined,
    symptoms: source.symptoms.map(tr),
    prevention: source.prevention.map(tr),
    nutrients: source.nutrients?.map(tr),
    pests: source.pests?.map(tr),
    treatment: source.treatment.map((step) => ({
      ...step,
      action: tr(step.action),
      timing: tr(step.timing),
      details: step.details ? tr(step.details) : undefined,
    })),
    youtubeVideos: source.youtubeVideos?.map((v) => ({
      ...v,
      title: tr(v.title),
    })),
  }
}

/** Server-side: translate diagnosis report for PDF / export. */
export async function translateDiagnosisForExport(
  source: CropDiagnosisResult,
  target: SupportedLanguage,
  sourceLang: SupportedLanguage = "en"
): Promise<CropDiagnosisResult> {
  if (target === sourceLang || target === "en" && sourceLang === "en") {
    return source
  }

  const originals = collectDiagnosisTexts(source)
  const translated = await translateTextsWithOpenAI(
    originals,
    target,
    sourceLang
  )
  return applyDiagnosisTranslations(source, originals, translated)
}
