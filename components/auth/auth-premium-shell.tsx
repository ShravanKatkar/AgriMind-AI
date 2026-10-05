"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { AuthCursorGlow } from "@/components/auth/auth-cursor-glow"
import { AuthParticleField } from "@/components/auth/auth-particle-field"
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel"
import { AuthForm } from "@/components/auth/auth-form"
import type { AuthDirection, AuthMode } from "@/components/auth/auth-types"
import { authPanelSpring, authSpring } from "@/components/auth/auth-types"
import { cn } from "@/lib/utils"

export function AuthPremiumShell() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [direction, setDirection] = useState<AuthDirection>(1)

  const onModeChange = useCallback((next: AuthMode) => {
    setDirection(next === "signup" ? 1 : -1)
    setMode(next)
  }, [])

  return (
    <motion.div
      data-no-translate
      className="relative min-h-screen overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            mode === "login"
              ? "radial-gradient(ellipse at top, oklch(0.48 0.15 156 / 0.12), transparent 55%), radial-gradient(ellipse at bottom right, oklch(0.75 0.14 95 / 0.1), transparent 50%)"
              : "radial-gradient(ellipse at top, oklch(0.50 0.14 158 / 0.14), transparent 55%), radial-gradient(ellipse at bottom left, oklch(0.70 0.12 156 / 0.12), transparent 50%)",
        }}
        transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
      />
      <AuthCursorGlow />
      <AuthParticleField />

      <motion.div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to home</span>
        </Link>
        <ThemeToggle className="rounded-full border border-border/60 bg-background/70 shadow-sm backdrop-blur-md" />
      </motion.div>

      <motion.div
        className="relative z-10 flex min-h-screen items-center justify-center p-4 py-16 md:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...authSpring, delay: 0.05 }}
      >
        <motion.div
          layout
          className="w-full max-w-[960px] overflow-hidden rounded-[28px] border border-white/20 bg-background/40 shadow-[0_32px_80px_-20px_oklch(0.2_0.05_156/0.40)] backdrop-blur-2xl dark:border-white/10 dark:bg-background/30"
          transition={authPanelSpring}
        >
          <div className="relative overflow-hidden">
            <motion.div
              className={cn(
                "flex flex-col md:flex-row",
                mode === "signup" && "md:flex-row-reverse"
              )}
              layout
              transition={authPanelSpring}
            >
              <motion.div
                layoutId="auth-brand-panel"
                className="relative w-full md:w-[46%]"
                transition={authPanelSpring}
              >
                <AuthBrandPanel mode={mode} direction={direction} />
              </motion.div>

              <motion.div
                layoutId="auth-form-panel"
                className={cn(
                  "relative w-full border-t border-border/40 bg-background/80 backdrop-blur-xl md:w-[54%] md:border-t-0",
                  mode === "login" ? "md:border-l" : "md:border-r"
                )}
                transition={authPanelSpring}
              >
                <AuthForm
                  mode={mode}
                  direction={direction}
                  onModeChange={onModeChange}
                  embedded
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
