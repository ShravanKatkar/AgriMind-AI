import { cookies } from "next/headers"
import { getAdminAuth } from "@/lib/firebase/admin"
import { COOKIE_NAMES, SESSION_MAX_AGE_MS } from "@/lib/constants"
import type { SessionUser, UserRole } from "@/types"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function createSessionCookie(
  idToken: string,
  cookieName: string
): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  })
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    )

    await connectDB()
    const dbUser = await User.findOne({ firebaseUid: decoded.uid }).lean()

    if (!dbUser) {
      return null
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? dbUser.email,
      displayName: dbUser.displayName ?? decoded.name ?? null,
      photoURL: dbUser.photoURL ?? decoded.picture ?? null,
      role: dbUser.role as UserRole,
      preferredLanguage: dbUser.preferredLanguage,
      district: dbUser.district,
      phone: dbUser.phone,
    }
  } catch {
    return null
  }
}

export async function getSessionUser(
  cookieName: string = COOKIE_NAMES.session
): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(cookieName)?.value
  if (!session) return null
  return verifySessionCookie(session)
}

export async function revokeSession(cookieName: string): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get(cookieName)?.value
  if (session) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(session)
      await getAdminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // Session already invalid
    }
  }
  cookieStore.delete(cookieName)
}
