import { NextResponse } from "next/server"
import { isSupportedLanguage } from "@/lib/i18n/languages"
import { getSessionUser } from "@/lib/auth/session"
import type { SupportedLanguage } from "@/types"
import {
  getUserByFirebaseUid,
  updateUserProfile,
  toFarmerProfile,
} from "@/services/user.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByFirebaseUid(session.uid)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: toFarmerProfile(user) })
  } catch (error) {
    console.error("[user/profile GET]", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const preferredLanguage: SupportedLanguage | undefined =
      body.preferredLanguage && isSupportedLanguage(body.preferredLanguage)
        ? body.preferredLanguage
        : undefined

    const user = await updateUserProfile(session.uid, {
      displayName: body.displayName,
      phone: body.phone,
      district: body.district,
      farmSize: body.farmSize,
      primaryCrops: body.primaryCrops,
      preferredLanguage,
      notificationPreferences: body.notificationPreferences,
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: toFarmerProfile(user) })
  } catch (error) {
    console.error("[user/profile PATCH]", error)
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
