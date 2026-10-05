import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { listDiagnosisReports } from "@/services/admin.service"

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const severity = searchParams.get("severity") ?? undefined

    const data = await listDiagnosisReports({ page, severity })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[admin/reports]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load reports" },
      { status: 500 }
    )
  }
}
