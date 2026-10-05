import { jsPDF } from "jspdf"
import { getAgriMindLogoDataUrl } from "@/lib/brand/logo-pdf"
import { ensurePdfFont, usesUnicodePdfFont } from "@/lib/pdf/font-setup"
import {
  formatPdfDate,
  getPdfLabels,
  severityLabel,
} from "@/lib/pdf/pdf-labels"
import type { CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

const HEADER_HEIGHT_MM = 32
const LOGO_SIZE_MM = 18

export interface DiagnosisPdfInput {
  farmerName: string
  cropType: string
  createdAt: Date
  diagnosis: CropDiagnosisResult
  language?: SupportedLanguage
  imageUrl?: string
}

export function generateDiagnosisPdf(input: DiagnosisPdfInput): Buffer {
  const lang = input.language ?? "en"
  const labels = getPdfLabels(lang)
  const unicodeFont = usesUnicodePdfFont(lang)
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  ensurePdfFont(doc, lang)

  const { diagnosis: d } = input
  let y = 18

  const applyFont = (emphasis = false) => {
    if (unicodeFont) {
      ensurePdfFont(doc, lang)
      return
    }
    doc.setFont("helvetica", emphasis ? "bold" : "normal")
  }

  const line = (text: string, size = 11, emphasis = false) => {
    const fontSize = unicodeFont && emphasis ? size + 1 : size
    doc.setFontSize(fontSize)
    applyFont(emphasis)
    const lines = doc.splitTextToSize(text, 180)
    const lineHeight = fontSize * 0.55
    if (y + lines.length * lineHeight > 280) {
      doc.addPage()
      ensurePdfFont(doc, lang)
      y = 18
    }
    doc.text(lines, 15, y)
    y += lines.length * lineHeight + 2
  }

  doc.setFillColor(34, 120, 70)
  doc.rect(0, 0, 210, HEADER_HEIGHT_MM, "F")

  const logo = getAgriMindLogoDataUrl()
  const titleX = logo ? 14 + LOGO_SIZE_MM + 5 : 15
  const logoY = (HEADER_HEIGHT_MM - LOGO_SIZE_MM) / 2

  if (logo) {
    doc.addImage(logo, "PNG", 14, logoY, LOGO_SIZE_MM, LOGO_SIZE_MM)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  applyFont(true)
  doc.text("AgriMind AI", titleX, 14)
  doc.setFontSize(11)
  applyFont(false)
  doc.text(labels.reportTitle, titleX, 22)

  doc.setTextColor(30, 30, 30)
  y = HEADER_HEIGHT_MM + 10

  line(`${labels.farmer}: ${input.farmerName}`, 11, true)
  line(
    `${labels.crop}: ${input.cropType}  |  ${labels.date}: ${formatPdfDate(input.createdAt, lang)}`
  )
  line(`${labels.disease}: ${d.disease}`, 13, true)
  line(
    `${labels.confidence}: ${d.confidence}%  |  ${labels.severity}: ${severityLabel(d.severity, labels)}`
  )
  y += 4

  line(labels.cause, 12, true)
  line(d.cause)
  line(labels.symptoms, 12, true)
  d.symptoms.forEach((s) => line(`• ${s}`))

  line(labels.treatment, 12, true)
  d.treatment.forEach((t) => {
    line(`${t.step}. ${t.action} (${t.timing})`, 11, true)
    if (t.details) line(t.details)
  })

  line(labels.prevention, 12, true)
  d.prevention.forEach((p) => line(`• ${p}`))

  line(labels.estimatedRecovery, 12, true)
  line(d.estimatedRecovery)
  line(labels.estimatedCost, 12, true)
  line(d.costEstimate)
  if (d.recoverySummary) {
    line(labels.recoveryOutlook, 12, true)
    line(d.recoverySummary)
  }
  if (d.irrigationNotes) {
    line(labels.irrigationNotes, 12, true)
    line(d.irrigationNotes)
  }
  if (d.followUpAdvice) {
    line(labels.followUp, 12, true)
    line(d.followUpAdvice)
  }

  y += 6
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  ensurePdfFont(doc, lang)
  const footerLines = doc.splitTextToSize(labels.footer, 180)
  doc.text(footerLines, 15, 285)

  const arrayBuffer = doc.output("arraybuffer")
  return Buffer.from(arrayBuffer)
}
