import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  getAdminOverviewStats,
  getSignupTrend,
  getPlatformActivityTrend,
  getDiagnosisSeverityBreakdown,
  getDistrictDistribution,
} from "@/services/admin.service"

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const [stats, signups, activity, severity, districts] = await Promise.all([
      getAdminOverviewStats(),
      getSignupTrend(30),
      getPlatformActivityTrend(14),
      getDiagnosisSeverityBreakdown(),
      getDistrictDistribution(),
    ])

    return NextResponse.json({
      success: true,
      data: { stats, signups, activity, severity, districts },
    })
  } catch (error) {
    console.error("[admin/stats]", error)
    return NextResponse.json(
      { success: false, error: "Failed to load admin stats" },
      { status: 500 }
    )
  }
}
