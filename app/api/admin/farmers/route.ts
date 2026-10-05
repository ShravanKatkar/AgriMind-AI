import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { listFarmers } from "@/services/admin.service"

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") ?? 1)
    const search = searchParams.get("search") ?? undefined

    const data = await listFarmers({ page, search })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[admin/farmers]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load farmers" },
      { status: 500 }
    )
  }
}
