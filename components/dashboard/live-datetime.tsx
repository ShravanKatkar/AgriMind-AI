"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { useLiveClock } from "@/hooks/use-live-clock"
import { cn } from "@/lib/utils"

type LiveDateTimeProps = {
  variant?: "compact" | "card" | "mobile-bar"
  className?: string
}

export function LiveDateTime({ variant = "compact", className }: LiveDateTimeProps) {
  const { time, dateLabel, shortDate } = useLiveClock()

  if (variant === "mobile-bar") {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-between gap-2 text-xs",
          className
        )}
        data-no-translate
      >
        <motion.div
          className="flex min-w-0 items-center gap-2"
          key={time}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-semibold tabular-nums text-foreground">
            {time}
          </span>
          <span className="shrink-0 text-muted-foreground">·</span>
          <span className="truncate text-muted-foreground">{shortDate}</span>
        </motion.div>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-primary/70">
          GMT+5:30
        </span>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3",
          className
        )}
        data-no-translate
      >
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Clock className="h-5 w-5 text-primary" />
        </motion.div>
        <motion.div
          className="min-w-0 text-right"
          key={time}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground">
            {time}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-primary/80">
            Sri Lanka (GMT+5:30)
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className={cn("shrink-0 text-left", className)}
      data-no-translate
    >
      <p className="text-sm font-semibold tabular-nums text-foreground">{time}</p>
      <p className="text-xs text-muted-foreground">{shortDate}</p>
    </div>
  )
}
