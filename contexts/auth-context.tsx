"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase/client"
import { validateFirebaseClientConfig } from "@/lib/firebase/config"
import {
  destroySession,
  establishSession,
  signOutFirebase,
} from "@/services/auth.service"
import type { SessionUser } from "@/types"

interface AuthContextValue {
  firebaseUser: User | null
  sessionUser: SessionUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setSessionUser(json.data)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const auth = getFirebaseAuth()
      const user = auth.currentUser
      if (!user) return false
      const idToken = await user.getIdToken(true)
      const res = await establishSession(idToken, "user")
      if (res.ok) {
        return await fetchSession()
      }
      return false
    } catch (err) {
      console.warn("[Firebase] refreshSession failed:", err)
      return false
    }
  }, [fetchSession])

  const getIdToken = useCallback(async (): Promise<string | null> => {
    try {
      const auth = getFirebaseAuth()
      const user = auth.currentUser
      if (!user) return null
      return await user.getIdToken()
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const { valid, missing } = validateFirebaseClientConfig()
    if (!valid) {
      console.warn(
        `[Firebase] Config incomplete in .env.local (${missing.join(", ")}). Authentication is inactive until configured.`
      )
      setLoading(false)
      return
    }

    try {
      const auth = getFirebaseAuth()
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseUser(user)
        if (user) {
          const sessionOk = await fetchSession()
          if (!sessionOk) {
            // Cookie expired or missing — automatically renew with fresh Firebase ID token!
            console.log("[Auth] Session cookie expired/missing, auto-renewing session...")
            try {
              const idToken = await user.getIdToken(true)
              await establishSession(idToken, "user")
              const renewed = await fetchSession()
              if (!renewed) {
                // Set fallback session user from Firebase client claims so user is never blocked
                setSessionUser({
                  uid: user.uid,
                  email: user.email ?? "",
                  displayName: user.displayName ?? user.email?.split("@")[0] ?? "Farmer",
                  photoURL: user.photoURL ?? null,
                  role: "farmer",
                  preferredLanguage: "en",
                })
              }
            } catch (renewalErr) {
              console.warn("[Auth] Session renewal error:", renewalErr)
              setSessionUser({
                uid: user.uid,
                email: user.email ?? "",
                displayName: user.displayName ?? user.email?.split("@")[0] ?? "Farmer",
                photoURL: user.photoURL ?? null,
                role: "farmer",
                preferredLanguage: "en",
              })
            }
          }
        } else {
          setSessionUser(null)
        }
        setLoading(false)
      })

      // Auto-refresh session cookie every 45 minutes to prevent expiration
      const interval = setInterval(() => {
        if (auth.currentUser) {
          refreshSession()
        }
      }, 45 * 60 * 1000)

      return () => {
        unsubscribe()
        clearInterval(interval)
      }
    } catch (err) {
      console.warn("[Firebase] Could not initialize auth:", err)
      setLoading(false)
    }
  }, [fetchSession, refreshSession])

  const signOut = useCallback(async () => {
    try {
      await destroySession("user")
      await signOutFirebase()
    } catch (err) {
      console.warn("[Firebase] signOut error:", err)
    }
    setSessionUser(null)
    setFirebaseUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        sessionUser,
        loading,
        signOut,
        refreshSession,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
