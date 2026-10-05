"use client"

import type { LucideIcon } from "lucide-react"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { cn } from "@/lib/utils"

type AdminPageHeaderProps = {
  title: string
  description?: string
  badge?: string
  icon?: LucideIcon
  className?: string
}

export function AdminPageHeader({
  title,
  description,
  badge = "Admin Console",
  icon: Icon,
  className,
}: AdminPageHeaderProps) {
  return (
    <ScrollReveal
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {badge}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </ScrollReveal>
  )
}
