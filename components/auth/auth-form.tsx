"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import { AuthInput } from "@/components/auth/auth-input"
import type { AuthDirection, AuthMode } from "@/components/auth/auth-types"
import { authSlideTransition, authSpring } from "@/components/auth/auth-types"
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  establishSession,
  resetPassword,
} from "@/services/auth.service"
import { cn } from "@/lib/utils"

type AuthFormProps = {
  mode: AuthMode
  direction?: AuthDirection
  onModeChange: (mode: AuthMode) => void
  embedded?: boolean
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.06,
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
  exit: { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.18 } },
}

const formPanelVariants = {
  enter: (direction: AuthDirection) => ({
    opacity: 0,
    x: direction > 0 ? 56 : -56,
    filter: "blur(8px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      ...authSlideTransition,
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: (direction: AuthDirection) => ({
    opacity: 0,
    x: direction > 0 ? -56 : 56,
    filter: "blur(8px)",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function AuthForm({
  mode,
  direction = 1,
  onModeChange,
  embedded = false,
}: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("from") ?? "/dashboard"

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSession(idToken: string) {
    const res = await establishSession(idToken, "user")
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to create session")
    }
    toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!")
    router.push(redirectTo)
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let credential
      if (mode === "login") {
        credential = await signInWithEmail(form.email, form.password)
      } else {
        if (form.password.length < 8) {
          toast.error("Password must be at least 8 characters")
          return
        }
        credential = await signUpWithEmail(
          form.email,
          form.password,
          form.name || "Farmer"
        )
      }
      const idToken = await credential.user.getIdToken()
      await handleSession(idToken)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed"
      toast.error(message.replace("Firebase: ", ""))
    } finally {
      setLoading(false)
    }
  }

  async function handleSocial(provider: "google" | "facebook") {
    setSocialLoading(provider)
    try {
      const credential =
        provider === "google"
          ? await signInWithGoogle()
          : await signInWithFacebook()
      const idToken = await credential.user.getIdToken()
      await handleSession(idToken)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Social login failed"
      toast.error(message.replace("Firebase: ", ""))
    } finally {
      setSocialLoading(null)
    }
  }

  async function handleForgotPassword() {
    if (!form.email) {
      toast.error("Enter your email address first")
      return
    }
    try {
      await resetPassword(form.email)
      toast.success("Password reset email sent!")
    } catch {
      toast.error("Could not send reset email")
    }
  }

  const inner = (
    <>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={mode}
          custom={direction}
          variants={formPanelVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="will-change-transform"
        >
          <motion.div variants={fieldVariants} custom={0} className="mb-6 text-center md:text-left">
            <motion.div
              className="mb-3 inline-flex"
              whileHover={{ scale: 1.05 }}
              transition={authSpring}
            >
              <AgriMindLogo size="xl" iconOnly href={null} />
            </motion.div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === "login" ? "Welcome back" : "Join AgriMind AI"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your smart farming dashboard"
                : "Start your smart farming journey today"}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  variants={fieldVariants}
                  custom={1}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                >
                  <AuthInput
                    id="name"
                    label="Full Name"
                    placeholder="Sunil Perera"
                    icon={User}
                    value={form.name}
                    onChange={update("name")}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fieldVariants} custom={mode === "signup" ? 2 : 1}>
              <AuthInput
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                value={form.email}
                onChange={update("email")}
                required
              />
            </motion.div>

            <motion.div variants={fieldVariants} custom={mode === "signup" ? 3 : 2}>
              <AuthInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={Lock}
                value={form.password}
                onChange={update("password")}
                required
                minLength={mode === "signup" ? 8 : 6}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
              {mode === "signup" && (
                <div className="mt-2">
                  <PasswordStrengthMeter password={form.password} />
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "login" && (
              <motion.div
                key="remember-row"
                variants={fieldVariants}
                custom={3}
                initial="hidden"
                animate="show"
                exit="exit"
                layout
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v === true)}
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fieldVariants} custom={mode === "login" ? 4 : 4} layout>
              <motion.div
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 12px 40px -12px oklch(0.48 0.15 156 / 0.45)",
                }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl"
              >
                <Button
                  type="submit"
                  className="group relative h-11 w-full overflow-hidden gap-2 text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={loading || !!socialLoading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-green-400 to-primary bg-[length:200%_100%] opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-[shimmer_2s_linear_infinite]" />
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          <motion.div variants={fieldVariants} custom={5} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <motion.div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-background/90 px-3 text-muted-foreground backdrop-blur-sm">
                Or continue with
              </span>
            </motion.div>
          </motion.div>

          <motion.div variants={fieldVariants} custom={6} className="grid grid-cols-2 gap-3">
            {(["google", "facebook"] as const).map((provider) => (
              <motion.div
                key={provider}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 24px -8px oklch(0.48 0.15 156 / 0.25)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-2 border-border/70 bg-background/50 backdrop-blur-sm"
                  disabled={loading || !!socialLoading}
                  onClick={() => handleSocial(provider)}
                >
                  {socialLoading === provider ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : provider === "google" ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span className="capitalize">{provider}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fieldVariants}
            custom={7}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => onModeChange("signup")}
                  className="font-semibold text-primary hover:underline"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign up
                </motion.button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => onModeChange("login")}
                  className="font-semibold text-primary hover:underline"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign in
                </motion.button>
              </>
            )}
          </motion.p>

          <motion.p
            variants={fieldVariants}
            custom={8}
            className="mt-4 text-center text-xs text-muted-foreground"
          >
            By continuing, you agree to our{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </>
  )

  if (embedded) {
    return <div className="p-6 md:p-8 lg:p-10">{inner}</div>
  }

  return (
    <motion.div layout className="relative w-full max-w-md" transition={authSpring}>
      <div className="glass rounded-3xl border border-white/20 p-8 shadow-2xl dark:border-white/10">
        {inner}
      </div>
    </motion.div>
  )
}
