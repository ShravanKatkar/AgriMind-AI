import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { translateDiagnosisForExport } from "@/lib/diagnosis/translate-for-export"
import { isSupportedLanguage } from "@/lib/i18n/languages"
import { getDiagnosisReport } from "@/services/diagnosis.service"
import { getUserByFirebaseUid } from "@/services/user.service"
import { generateDiagnosisPdf } from "@/services/pdf.service"
import type { CropDiagnosisResult } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const report = await getDiagnosisReport(session.uid, id)
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const langParam = searchParams.get("lang")
    const user = await getUserByFirebaseUid(session.uid)

    let language: SupportedLanguage = "en"
    if (langParam && isSupportedLanguage(langParam)) {
      language = langParam
    } else if (
      user?.preferredLanguage &&
      isSupportedLanguage(String(user.preferredLanguage))
    ) {
      language = user.preferredLanguage as SupportedLanguage
    }

    const sourceLang =
      (report.language as SupportedLanguage | undefined) ?? "en"
    const sourceResult = report.result as unknown as CropDiagnosisResult

    let diagnosis = sourceResult
    if (language !== sourceLang) {
      try {
        diagnosis = await translateDiagnosisForExport(
          sourceResult,
          language,
          sourceLang
        )
      } catch (err) {
        console.error("[diagnosis/pdf] translation failed", err)
      }
    }

    const pdf = generateDiagnosisPdf({
      farmerName: user?.displayName ?? "Farmer",
      cropType: report.cropType,
      createdAt: report.createdAt,
      diagnosis,
      language,
      imageUrl: report.imageUrl,
    })

    const filename = `agrimind-diagnosis-${report.cropType}-${language}-${id}.pdf`.replace(
      /\s+/g,
      "-"
    )

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[diagnosis/pdf]", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
