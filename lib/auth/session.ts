import { cookies, headers } from "next/headers"
import { getAdminAuth } from "@/lib/firebase/admin"
import { COOKIE_NAMES, SESSION_MAX_AGE_MS } from "@/lib/constants"
import type { SessionUser, UserRole, SupportedLanguage } from "@/types"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function createSessionCookie(
  idToken: string,
  _cookieName: string = COOKIE_NAMES.session
): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  })
}

interface DecodedClaims {
  uid: string
  email?: string
  name?: string
  picture?: string
  role?: string
}

async function resolveSessionUser(decoded: DecodedClaims): Promise<SessionUser> {
  let dbUser: Record<string, unknown> | null = null

  try {
    await connectDB()
    dbUser = (await User.findOne({ firebaseUid: decoded.uid }).lean()) as Record<string, unknown> | null
  } catch (err) {
    // MongoDB may be offline, IP restricted, or slow — do not fail the user session
    console.warn(
      `[auth/session] DB lookup skipped for ${decoded.uid}:`,
      (err as Error).message
    )
  }

  const email = decoded.email ?? (dbUser?.email as string) ?? ""
  const fallbackName = decoded.name ?? (email ? email.split("@")[0] : "Farmer")

  return {
    uid: decoded.uid,
    email,
    displayName: (dbUser?.displayName as string) ?? fallbackName ?? "Farmer",
    photoURL: (dbUser?.photoURL as string) ?? decoded.picture ?? null,
    role: ((dbUser?.role as UserRole) ?? (decoded.role as UserRole) ?? "farmer") as UserRole,
    preferredLanguage:
      ((dbUser?.preferredLanguage as SupportedLanguage) ?? "en") as SupportedLanguage,
    district: (dbUser?.district as string) ?? undefined,
    phone: (dbUser?.phone as string) ?? undefined,
  }
}

export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  if (!sessionCookie?.trim()) return null

  try {
    let decoded: DecodedClaims | null = null

    // 1. Try verifying as standard Firebase session cookie
    try {
      decoded = (await getAdminAuth().verifySessionCookie(
        sessionCookie,
        false
      )) as unknown as DecodedClaims
    } catch {
      // 2. If it's an ID token stored in the cookie, verify as ID token
      try {
        decoded = (await getAdminAuth().verifyIdToken(
          sessionCookie
        )) as unknown as DecodedClaims
      } catch {
        return null
      }
    }

    if (!decoded || !decoded.uid) {
      return null
    }

    return await resolveSessionUser(decoded)
  } catch (err) {
    console.error("[auth/session] verifySessionCookie error:", err)
    return null
  }
}

export async function verifyIdTokenUser(
  idToken: string
): Promise<SessionUser | null> {
  if (!idToken?.trim()) return null

  try {
    const decoded = (await getAdminAuth().verifyIdToken(
      idToken
    )) as unknown as DecodedClaims
    if (!decoded || !decoded.uid) return null
    return await resolveSessionUser(decoded)
  } catch {
    return null
  }
}

export async function getSessionUser(
  cookieName: string = COOKIE_NAMES.session
): Promise<SessionUser | null> {
  // 1. Check session cookie
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(cookieName)?.value
    if (session) {
      const user = await verifySessionCookie(session)
      if (user) return user
    }
  } catch {
    // cookies() unavailable in edge or special contexts
  }

  // 2. Check Authorization: Bearer <idToken> header as fallback
  try {
    const headerStore = await headers()
    const authHeader = headerStore.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim()
      if (token) {
        const user = await verifyIdTokenUser(token)
        if (user) return user
      }
    }
  } catch {
    // headers() unavailable
  }

  return null
}

export async function revokeSession(cookieName: string): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get(cookieName)?.value
  if (session) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(session, false)
      await getAdminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // Session already invalid
    }
  }
  cookieStore.delete(cookieName)
}

