import type { CropDiagnosisResult } from "@/types/ai"
import { DiagnosisIncompleteError } from "@/lib/openai/diagnosis-incomplete"

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim() || fallback
  if (typeof v === "number") return String(v)
  return fallback
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    if (typeof v === "string" && v.trim()) return [v.trim()]
    return []
  }
  return v
    .map((item) => {
      if (typeof item === "string") return item.trim()
      if (item && typeof item === "object" && "text" in item) {
        return asString((item as { text: unknown }).text)
      }
      return ""
    })
    .filter(Boolean)
}

function normalizeSeverity(v: unknown): "low" | "medium" | "high" {
  const s = asString(v).toLowerCase()
  if (s.includes("high") || s.includes("severe")) return "high"
  if (s.includes("low") || s.includes("mild")) return "low"
  if (s.includes("medium") || s.includes("moderate")) return "medium"
  return "medium"
}

function normalizeTreatment(v: unknown): CropDiagnosisResult["treatment"] {
  if (!Array.isArray(v)) return []

  const steps: CropDiagnosisResult["treatment"] = []
  v.forEach((item, index) => {
    if (typeof item === "string" && item.trim()) {
      steps.push({
        step: index + 1,
        action: item.trim(),
        timing: "As soon as possible",
      })
      return
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>
      const action = asString(o.action ?? o.description ?? o.title)
      if (!action) return
      const details = asString(o.details ?? o.explanation ?? o.instructions)
      steps.push({
        step: Number(o.step) > 0 ? Number(o.step) : index + 1,
        action,
        timing: asString(o.timing ?? o.when ?? o.schedule, "Follow label instructions"),
        details: details || undefined,
      })
    }
  })
  return steps
}

function normalizeVideos(
  v: unknown,
  cropType: string,
  disease: string
): { title: string; searchQuery: string; language?: string }[] {
  if (!Array.isArray(v)) return []

  return v
    .map((item) => {
      if (typeof item === "string") {
        return { title: item, searchQuery: `${item} ${cropType} Sri Lanka farming` }
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>
        const title = asString(o.title)
        const searchQuery = asString(o.searchQuery ?? o.query ?? o.search ?? title)
        if (!title && !searchQuery) return null
        return {
          title: title || searchQuery,
          searchQuery: searchQuery || `${title} ${cropType}`,
          language: asString(o.language) || undefined,
        }
      }
      return null
    })
    .filter((x): x is { title: string; searchQuery: string; language?: string } =>
      Boolean(x)
    )
    .slice(0, 4)
}

const NON_PLANT_PATTERNS = [
  /not\s+(a\s+)?plant/i,
  /no\s+plant/i,
  /does\s+not\s+contain\s+any\s+plant/i,
  /not\s+contain\s+.*plant/i,
  /not\s+a\s+crop/i,
  /no\s+visible\s+plant/i,
  /unrelated\s+to\s+plant/i,
  /diagram\s+or\s+chart/i,
  /handwriting/i,
  /document/i,
  /invalid\s+image/i,
  /please\s+upload.*plant/i,
]

function textSuggestsNonPlant(...parts: string[]): boolean {
  const blob = parts.join(" ").toLowerCase()
  return NON_PLANT_PATTERNS.some((re) => re.test(blob))
}

function resolvePlantValidity(o: Record<string, unknown>): {
  isValidPlantImage: boolean
  rejectionReason: string
} {
  const explicit =
    o.isValidPlantImage === false ||
    o.is_valid_plant_image === false ||
    o.validPlantImage === false

  const rejectionReason = asString(
    o.rejectionReason ?? o.rejection_reason ?? o.userMessage ?? o.message
  )

  const disease = asString(o.disease)
  const cause = asString(o.cause)
  const confidence = Number(o.confidence)

  const heuristic =
    explicit ||
    textSuggestsNonPlant(rejectionReason, disease, cause) ||
    (confidence <= 20 &&
      textSuggestsNonPlant(disease, cause, asString(o.followUpAdvice)))

  if (!heuristic) {
    return { isValidPlantImage: true, rejectionReason: "" }
  }

  const reason =
    rejectionReason ||
    cause ||
    "This image does not show a plant or crop. Please upload a clear photo of leaves, stems, fruits, or the field."

  return { isValidPlantImage: false, rejectionReason: reason }
}

const MIN_SYMPTOM_LEN = 40
const MIN_PREVENTION_LEN = 50
const MIN_PARAGRAPH_LEN = 80
const MIN_TREATMENT_DETAILS_LEN = 80

function assertRichDiagnosis(result: CropDiagnosisResult): void {
  const missing: string[] = []

  if (asString(result.cause).length < MIN_PARAGRAPH_LEN) {
    missing.push("cause")
  }

  const richSymptoms = result.symptoms.filter((s) => s.length >= MIN_SYMPTOM_LEN)
  if (richSymptoms.length < 4) missing.push("symptoms (need 4+ detailed)")

  const richSteps = result.treatment.filter(
    (t) =>
      t.action.length >= 10 &&
      t.timing.length >= 5 &&
      (t.details?.length ?? 0) >= MIN_TREATMENT_DETAILS_LEN
  )
  if (richSteps.length < 3) {
    missing.push("treatment (need 3+ steps with details)")
  }

  const richPrevention = result.prevention.filter((p) => p.length >= MIN_PREVENTION_LEN)
  if (richPrevention.length < 4) missing.push("prevention (need 4+ detailed)")

  if (asString(result.estimatedRecovery).length < MIN_PARAGRAPH_LEN) {
    missing.push("estimatedRecovery")
  }
  if (asString(result.costEstimate).length < MIN_PARAGRAPH_LEN) {
    missing.push("costEstimate")
  }
  if (asString(result.recoverySummary).length < MIN_PARAGRAPH_LEN) {
    missing.push("recoverySummary")
  }

  if (missing.length > 0) {
    throw new DiagnosisIncompleteError(missing)
  }
}

/** Coerce OpenAI JSON into diagnosis — no generic defaults for valid plant images */
export function normalizeDiagnosisPayload(
  raw: unknown,
  cropType: string,
  options?: { skipValidation?: boolean }
): CropDiagnosisResult & {
  youtubeVideos: { title: string; searchQuery: string; language?: string }[]
} {
  const o =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}

  const { isValidPlantImage, rejectionReason } = resolvePlantValidity(o)

  if (!isValidPlantImage) {
    const cause =
      asString(o.cause) ||
      rejectionReason ||
      `The uploaded image does not show a real plant or crop. Please take a new photo in natural light showing the affected plant parts.`

    return {
      isValidPlantImage: false,
      rejectionReason,
      disease: asString(o.disease, "Not a plant image"),
      confidence: 0,
      severity: "low",
      cause,
      symptoms: asStringArray(o.symptoms),
      treatment: normalizeTreatment(o.treatment),
      prevention: asStringArray(o.prevention),
      estimatedRecovery: asString(o.estimatedRecovery, "—"),
      costEstimate: asString(o.costEstimate, "—"),
      followUpAdvice:
        asString(o.followUpAdvice) ||
        "Upload a clear photo of your crop in the field or garden.",
      youtubeVideos: [],
    }
  }

  let disease = asString(o.disease)
  if (
    !disease ||
    disease.toLowerCase() === "unknown" ||
    disease.toLowerCase().includes("not supported") ||
    disease.toLowerCase().includes("cannot analyze")
  ) {
    throw new DiagnosisIncompleteError(["disease name"])
  }

  let confidence = Number(o.confidence)
  if (Number.isNaN(confidence)) confidence = 70
  confidence = Math.min(100, Math.max(40, Math.round(confidence)))

  const cause = asString(o.cause)
  const symptoms = asStringArray(o.symptoms)
  const treatment = normalizeTreatment(o.treatment)
  const prevention = asStringArray(o.prevention)
  const estimatedRecovery = asString(o.estimatedRecovery)
  const costEstimate = asString(o.costEstimate)
  const recoverySummary = asString(
    o.recoverySummary ?? o.recovery_summary ?? o.recoveryNotes
  )

  const result: CropDiagnosisResult & {
    youtubeVideos: { title: string; searchQuery: string; language?: string }[]
  } = {
    isValidPlantImage: true,
    disease,
    confidence,
    severity: normalizeSeverity(o.severity),
    cause,
    symptoms,
    treatment,
    prevention,
    estimatedRecovery,
    costEstimate,
    recoverySummary: recoverySummary || undefined,
    nutrients: asStringArray(o.nutrients),
    pests: asStringArray(o.pests),
    irrigationNotes: asString(o.irrigationNotes) || undefined,
    followUpAdvice: asString(o.followUpAdvice) || undefined,
    youtubeVideos: normalizeVideos(o.youtubeVideos, cropType, disease),
  }

  if (!options?.skipValidation) {
    assertRichDiagnosis(result)
  }

  return result
}
