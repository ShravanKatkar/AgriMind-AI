import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { createSessionCookie } from "@/lib/auth/session"
import { upsertUserFromAuth, isAdminUser } from "@/services/user.service"
import { COOKIE_NAMES, SESSION_MAX_AGE_MS } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Missing ID token" },
        { status: 400 }
      )
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken)
    const admin = await isAdminUser(decoded.uid)

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Admin access only.",
        },
        { status: 403 }
      )
    }

    await upsertUserFromAuth({
      firebaseUid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name ?? "Admin",
      photoURL: decoded.picture,
      role: "admin",
    })

    const sessionCookie = await createSessionCookie(
      idToken,
      COOKIE_NAMES.adminSession
    )

    const response = NextResponse.json({
      success: true,
      data: {
        uid: decoded.uid,
        email: decoded.email,
        role: "admin",
      },
    })

    response.cookies.set(COOKIE_NAMES.adminSession, sessionCookie, {
      maxAge: SESSION_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[auth/admin/session]", error)
    const msg = error instanceof Error ? error.message : String(error)
    let userMessage = "Failed to create admin session"
    if (msg.includes("querySrv") || msg.includes("ECONNREFUSED") || msg.includes("MongoServerSelectionError")) {
      userMessage =
        "Cannot connect to MongoDB. Check MONGODB_URI and Atlas Network Access, then restart npm run dev."
    }
    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    )
  }
}
