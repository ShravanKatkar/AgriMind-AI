"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Camera, Mic, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"

const actions = [
  {
    key: "scan" as const,
    href: "/dashboard/diagnosis",
    icon: Camera,
    titleKey: "dashboard.scanCrop.title" satisfies UiCatalogKey,
    descKey: "dashboard.scanCrop.desc" satisfies UiCatalogKey,
    ctaKey: "dashboard.scanCrop.cta" satisfies UiCatalogKey,
    className:
      "from-green-600 via-primary to-green-700 shadow-green-900/25 hover:shadow-green-900/35",
    iconWrap: "bg-white/20 ring-white/30",
    focusRing: "focus-visible:ring-primary",
  },
  {
    key: "ask" as const,
    href: "/dashboard/voice",
    icon: Mic,
    titleKey: "dashboard.askAi.title" satisfies UiCatalogKey,
    descKey: "dashboard.askAi.desc" satisfies UiCatalogKey,
    ctaKey: "dashboard.askAi.cta" satisfies UiCatalogKey,
    className:
      "from-teal-700 via-teal-500 to-cyan-600 shadow-teal-900/30 hover:shadow-teal-900/40",
    iconWrap: "bg-white/20 ring-white/30",
    focusRing: "focus-visible:ring-teal-400",
  },
] as const

export function DashboardPrimaryActions() {
  const { t } = useLanguage()

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.4 }}
      className="grid gap-4 sm:grid-cols-2"
      aria-label="Primary actions"
      data-no-translate
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.08 }}
        >
          <Link
            href={action.href}
            className={cn(
              "group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all duration-300",
              "bg-gradient-to-br hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              action.focusRing,
              action.className
            )}
          >
            <motion.div
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110"
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/10 blur-xl"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm",
                  action.iconWrap
                )}
              >
                <action.icon className="h-7 w-7" strokeWidth={2} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {index === 0 ? "Photo check" : "Voice help"}
              </span>
            </div>

            <div className="relative mt-6 space-y-2">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t(action.titleKey)}
              </h2>
              <p className="max-w-[280px] text-sm leading-relaxed text-white/85">
                {t(action.descKey)}
              </p>
            </div>

            <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold">
              <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm transition-colors group-hover:bg-white/30">
                {t(action.ctaKey)}
              </span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.section>
  )
}
