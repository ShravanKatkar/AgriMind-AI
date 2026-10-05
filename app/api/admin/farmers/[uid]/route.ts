import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { updateFarmerByAdmin } from "@/services/admin.service"
import type { UserRole } from "@/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { uid } = await params
    const body = await request.json()
    const { isActive, role } = body as { isActive?: boolean; role?: UserRole }

    if (uid === auth.uid && role && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot demote your own admin account" },
        { status: 400 }
      )
    }

    const user = await updateFarmerByAdmin(uid, { isActive, role })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("[admin/farmers PATCH]", error)
    return NextResponse.json(
      { success: false, error: "Failed to update farmer" },
      { status: 500 }
    )
  }
}
