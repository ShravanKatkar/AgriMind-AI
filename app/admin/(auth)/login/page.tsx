"use client"

import { Suspense } from "react"
import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { AnimatedBackground } from "@/components/shared/animated-background"

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <AnimatedBackground />
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"
        aria-hidden
      />
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-muted" />
        }
      >
        <div className="relative z-10 px-4">
          <AdminLoginForm />
        </div>
      </Suspense>
    </div>
  )
}
