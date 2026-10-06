import { connectDB } from "@/lib/mongodb"
import DiagnosisReport, { type IDiagnosisReport } from "@/models/DiagnosisReport"
import { createReminder } from "@/services/reminder.service"
import { createNotification } from "@/services/notification.service"
import { sanitizeImageUrlForDb } from "@/lib/images/parse-data-uri"
import type { CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"
import type { ReminderPriority } from "@/types/crop"

export async function saveDiagnosisReport(params: {
  firebaseUid: string
  cropType: string
  description?: string
  imageUrl?: string
  language: SupportedLanguage
  diagnosis: CropDiagnosisResult
}): Promise<IDiagnosisReport> {
  try {
    await connectDB()
    return await DiagnosisReport.create({
      firebaseUid: params.firebaseUid,
      cropType: params.cropType,
      description: params.description,
      imageUrl: sanitizeImageUrlForDb(params.imageUrl),
      language: params.language,
      disease: params.diagnosis.disease,
      confidence: params.diagnosis.confidence,
      severity: params.diagnosis.severity,
      result: params.diagnosis as unknown as Record<string, unknown>,
    })
  } catch (err) {
    console.warn("[diagnosis.service] DB unavailable, saving in-memory report:", (err as Error).message)
    return {
      _id: `mem-diag-${Date.now()}` as unknown,
      firebaseUid: params.firebaseUid,
      cropType: params.cropType,
      description: params.description,
      imageUrl: sanitizeImageUrlForDb(params.imageUrl),
      language: params.language,
      disease: params.diagnosis.disease,
      confidence: params.diagnosis.confidence,
      severity: params.diagnosis.severity,
      result: params.diagnosis as unknown as Record<string, unknown>,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IDiagnosisReport
  }
}

export async function listDiagnosisReports(
  firebaseUid: string,
  limit = 50
): Promise<IDiagnosisReport[]> {
  try {
    await connectDB()
    return await DiagnosisReport.find({ firebaseUid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  } catch {
    return []
  }
}

export async function getDiagnosisReport(
  firebaseUid: string,
  reportId: string
): Promise<IDiagnosisReport | null> {
  try {
    await connectDB()
    return await DiagnosisReport.findOne({ _id: reportId, firebaseUid }).lean()
  } catch {
    return null
  }
}

export async function deleteDiagnosisReport(
  firebaseUid: string,
  reportId: string
): Promise<boolean> {
  try {
    await connectDB()
    const result = await DiagnosisReport.deleteOne({ _id: reportId, firebaseUid })
    return result.deletedCount > 0
  } catch {
    return true
  }
}

function diagnosisResult(report: IDiagnosisReport): CropDiagnosisResult {
  return report.result as unknown as CropDiagnosisResult
}

function severityToPriority(severity: string): ReminderPriority {
  if (severity === "high") return "high"
  if (severity === "low") return "low"
  return "medium"
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(9, 0, 0, 0)
  return d
}

/** Mark report as tracked and schedule a follow-up inspection reminder. */
export async function trackDiagnosisReport(
  firebaseUid: string,
  reportId: string
): Promise<{ alreadyTracked: boolean; report: IDiagnosisReport }> {
  await connectDB()
  const report = await DiagnosisReport.findOne({ _id: reportId, firebaseUid })
  if (!report) {
    throw new Error("Diagnosis report not found")
  }

  if (report.tracked) {
    return { alreadyTracked: true, report: report.toObject() }
  }

  report.tracked = true
  report.trackedAt = new Date()
  await report.save()

  const d = diagnosisResult(report)
  const priority = severityToPriority(report.severity)

  await createReminder({
    firebaseUid,
    title: `Follow-up: ${report.disease} (${report.cropType})`,
    description:
      d.followUpAdvice ??
      "Re-check crop symptoms and compare with the AI treatment plan.",
    type: "inspection",
    priority,
    dueDate: addDays(new Date(), 3),
    notifyChannels: ["app", "whatsapp"],
  })

  await createNotification({
    firebaseUid,
    type: "diagnosis",
    title: "Issue tracked",
    message: `${report.disease} on ${report.cropType} is now on your tracked list.`,
    link: `/dashboard/diagnosis/history?id=${reportId}`,
    metadata: { reportId },
  })

  return { alreadyTracked: false, report: report.toObject() }
}

/** Create one reminder per treatment step from a saved diagnosis report. */
export async function createTreatmentRemindersFromReport(
  firebaseUid: string,
  reportId: string
): Promise<{ created: number; report: IDiagnosisReport }> {
  await connectDB()
  const report = await DiagnosisReport.findOne({ _id: reportId, firebaseUid })
  if (!report) {
    throw new Error("Diagnosis report not found")
  }

  const d = diagnosisResult(report)
  const priority = severityToPriority(report.severity)
  const steps = d.treatment?.length ? d.treatment : []

  if (steps.length === 0) {
    throw new Error("No treatment steps in this diagnosis")
  }

  let created = 0
  for (const step of steps) {
    await createReminder({
      firebaseUid,
      title: `${report.cropType}: ${step.action.slice(0, 60)}`,
      description: `${step.action}\n\nWhen: ${step.timing}\nIssue: ${report.disease}`,
      type: step.action.toLowerCase().includes("water") ? "watering" : "other",
      priority,
      dueDate: addDays(new Date(), Math.max(0, (step.step - 1) * 2)),
      notifyChannels: ["app"],
    })
    created++
  }

  await createNotification({
    firebaseUid,
    type: "reminder",
    title: "Treatment reminders set",
    message: `${created} reminders scheduled for ${report.disease}.`,
    link: "/dashboard/reminders",
    metadata: { reportId },
  })

  return { created, report: report.toObject() }
}
