import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { listOfficers } from "@/services/admin.service"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const officers = await listOfficers()
    return NextResponse.json({ success: true, data: officers })
  } catch (error) {
    console.error("[admin/officers]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load officers" },
      { status: 500 }
    )
  }
}
