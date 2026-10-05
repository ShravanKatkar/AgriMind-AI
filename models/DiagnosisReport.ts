import mongoose, { Schema, type Document, type Model } from "mongoose"
import { SUPPORTED_LANGUAGE_CODES } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export interface IDiagnosisReport extends Document {
  firebaseUid: string
  cropType: string
  description?: string
  imageUrl?: string
  language: SupportedLanguage
  disease: string
  confidence: number
  severity: "low" | "medium" | "high"
  result: Record<string, unknown>
  tracked?: boolean
  trackedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DiagnosisReportSchema = new Schema<IDiagnosisReport>(
  {
    firebaseUid: { type: String, required: true, index: true },
    cropType: { type: String, required: true },
    description: String,
    imageUrl: String,
    language: { type: String, enum: SUPPORTED_LANGUAGE_CODES, default: "en" },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    result: { type: Schema.Types.Mixed, required: true },
    tracked: { type: Boolean, default: false, index: true },
    trackedAt: Date,
  },
  { timestamps: true }
)

DiagnosisReportSchema.index({ createdAt: -1 })

const DiagnosisReport: Model<IDiagnosisReport> =
  mongoose.models.DiagnosisReport ??
  mongoose.model<IDiagnosisReport>("DiagnosisReport", DiagnosisReportSchema)

export default DiagnosisReport
