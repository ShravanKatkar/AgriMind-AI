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
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const json = await res.json()
        setSessionUser(json.data ?? null)
      } else {
        setSessionUser(null)
      }
    } catch {
      setSessionUser(null)
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
          await fetchSession()
        } else {
          setSessionUser(null)
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } catch (err) {
      console.warn("[Firebase] Could not initialize auth:", err)
      setLoading(false)
    }
  }, [fetchSession])

  const refreshSession = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      const user = auth.currentUser
      if (!user) return
      const idToken = await user.getIdToken(true)
      await establishSession(idToken, "user")
      await fetchSession()
    } catch (err) {
      console.warn("[Firebase] refreshSession skipped:", err)
    }
  }, [fetchSession])

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
