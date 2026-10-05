"use client"

import { motion } from "framer-motion"
import { Globe2 } from "lucide-react"
import { SOUTH_ASIA_MARKETS } from "@/lib/landing/regions"

type SouthAsiaRegionsBarProps = {
  className?: string
  variant?: "hero" | "compact"
}

export function SouthAsiaRegionsBar({
  className = "",
  variant = "hero",
}: SouthAsiaRegionsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className={className}
    >
      <div className="flex items-center justify-center gap-2 lg:justify-start">
        <Globe2 className="h-4 w-4 shrink-0 text-agri-teal" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Built for South Asia
        </p>
      </div>
      <div
        className={
          variant === "hero"
            ? "mt-3 flex flex-wrap justify-center gap-2 lg:justify-start"
            : "mt-2 flex flex-wrap justify-center gap-1.5"
        }
      >
        {SOUTH_ASIA_MARKETS.map((country) => (
          <span
            key={country}
            className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-foreground/80 sm:text-xs"
          >
            {country}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
