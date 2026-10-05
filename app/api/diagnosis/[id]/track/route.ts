import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { trackDiagnosisReport } from "@/services/diagnosis.service"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await trackDiagnosisReport(session.uid, id)

    return NextResponse.json({
      success: true,
      data: {
        alreadyTracked: result.alreadyTracked,
        reportId: String(result.report._id),
      },
    })
  } catch (error) {
    console.error("[diagnosis/track]", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to track issue",
      },
      { status: 500 }
    )
  }
}
