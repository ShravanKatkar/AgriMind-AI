"use client"

import Link from "next/link"
import { FileText, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import { buildDiagnosisShareUrl } from "@/services/whatsapp.service"
import type { CropDiagnosisResult } from "@/types/ai"

interface DiagnosisReportActionsProps {
  reportId: string
  cropType: string
  diagnosis: CropDiagnosisResult
}

export function DiagnosisReportActions({
  reportId,
  cropType,
  diagnosis,
}: DiagnosisReportActionsProps) {
  const { language } = useLanguage()
  const whatsappUrl = buildDiagnosisShareUrl({ cropType, diagnosis, reportId })
  const pdfHref = `/api/diagnosis/${reportId}/pdf?lang=${encodeURIComponent(language)}`

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <a href={pdfHref} target="_blank" rel="noopener noreferrer">
          <FileText className="h-4 w-4" />
          Download PDF ({getLanguageDisplayLabel(language)})
        </a>
      </Button>
      <Button variant="outline" size="sm" className="gap-2" asChild>
        <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          Share via WhatsApp
        </Link>
      </Button>
    </div>
  )
}
