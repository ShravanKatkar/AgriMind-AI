import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase/admin"
import { createSessionCookie } from "@/lib/auth/session"
import { upsertUserFromAuth } from "@/services/user.service"
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

    const user = await upsertUserFromAuth({
      firebaseUid: decoded.uid,
      email: decoded.email ?? "",
      displayName: decoded.name ?? decoded.email?.split("@")[0] ?? "Farmer",
      photoURL: decoded.picture,
    })

    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin accounts must sign in through the admin portal.",
        },
        { status: 403 }
      )
    }

    const sessionCookie = await createSessionCookie(
      idToken,
      COOKIE_NAMES.session
    )

    const response = NextResponse.json({
      success: true,
      data: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    })

    response.cookies.set(COOKIE_NAMES.session, sessionCookie, {
      maxAge: SESSION_MAX_AGE_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[auth/session]", error)
    const msg = error instanceof Error ? error.message : String(error)

    let userMessage = "Failed to create session"
    if (msg.includes("querySrv") || msg.includes("ECONNREFUSED") || msg.includes("MongoServerSelectionError")) {
      userMessage =
        "Cannot connect to MongoDB. Check MONGODB_URI in .env.local, allow your IP in Atlas Network Access, then restart npm run dev."
    } else if (msg.includes("FIREBASE_ADMIN") || msg.includes("private key")) {
      userMessage =
        "Firebase Admin is misconfigured. Check FIREBASE_ADMIN_* variables in .env.local."
    } else if (process.env.NODE_ENV === "development") {
      userMessage = `Failed to create session: ${msg}`
    }

    return NextResponse.json(
      { success: false, error: userMessage },
      { status: 500 }
    )
  }
}
