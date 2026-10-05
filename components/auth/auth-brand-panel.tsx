"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Camera, Globe, Mic, Sparkles } from "lucide-react"
import type { AuthDirection, AuthMode } from "@/components/auth/auth-types"
import { authSlideTransition } from "@/components/auth/auth-types"

const features = [
  { icon: Mic, label: "Voice in 3 languages", sub: "Hindi · Marathi · English" },
  { icon: Camera, label: "AI crop diagnosis", sub: "95% accuracy rate" },
  { icon: Globe, label: "24/7 AI support", sub: "Always available" },
  { icon: Sparkles, label: "Smart reminders", sub: "Never miss a task" },
]

const copy = {
  login: {
    badge: "AI-Powered Agriculture",
    title: "Your AI Farming Partner",
    highlight: "From Seed To Harvest",
    body: "Join thousands of farmers using AgriMind AI for crop diagnosis, multilingual voice support, and smart farming guidance.",
  },
  signup: {
    badge: "Start Free Today",
    title: "Grow Smarter With",
    highlight: "AgriMind AI",
    body: "Create your account in seconds. Get instant crop diagnosis, voice assistant in your language, and personalized farming insights.",
  },
}

export function AuthBrandPanel({
  mode,
  direction,
}: {
  mode: AuthMode
  direction: AuthDirection
}) {
  const c = copy[mode]

  return (
    <motion.div
      data-no-translate
      className="relative flex h-full min-h-[480px] flex-col justify-between overflow-hidden p-8 text-white md:p-10"
      initial={false}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            mode === "login"
              ? "linear-gradient(145deg, oklch(0.40 0.14 156) 0%, oklch(0.34 0.12 158) 45%, oklch(0.28 0.08 175) 100%)"
              : "linear-gradient(145deg, oklch(0.36 0.12 158) 0%, oklch(0.44 0.16 152) 50%, oklch(0.32 0.10 95) 100%)",
        }}
        transition={{ duration: 0.8, ease: [0.45, 0, 0.55, 1] }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 min-h-[220px]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={mode}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? -36 : 36, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{
              opacity: 0,
              x: direction > 0 ? 36 : -36,
              y: -8,
              transition: { duration: 0.28 },
            }}
            transition={authSlideTransition}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {c.badge}
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {c.title}
              <br />
              <span className="bg-gradient-to-r from-emerald-200 via-lime-200 to-amber-200 bg-clip-text text-transparent">
                {c.highlight}
              </span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80 md:text-base">
              {c.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-3">
        {features.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.35 }}
            className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md transition-colors hover:bg-white/15"
            whileHover={{ y: -2 }}
          >
            <item.icon className="mb-2 h-4 w-4 text-emerald-200" />
            <p className="text-xs font-semibold">{item.label}</p>
            <p className="text-[10px] text-white/65">{item.sub}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
