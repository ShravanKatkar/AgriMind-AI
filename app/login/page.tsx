"use client"

import { Suspense } from "react"
import { AuthPremiumShell } from "@/components/auth/auth-premium-shell"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-primary/40" />
        </div>
      }
    >
      <AuthPremiumShell />
    </Suspense>
  )
}
