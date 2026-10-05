import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { listDiagnosisReports } from "@/services/diagnosis.service"

export async function GET(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100)

    const reports = await listDiagnosisReports(session.uid, limit)
    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error("[diagnosis GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load history" },
      { status: 500 }
    )
  }
}
