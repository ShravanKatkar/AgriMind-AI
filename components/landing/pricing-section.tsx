"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Sparkles, Calendar, CalendarDays, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BILLING_PLANS } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"

const PLAN_ICONS = {
  trial: Calendar,
  monthly: CalendarDays,
  yearly: CalendarRange,
} as const

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-agri-teal/5"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-agri-teal/10 text-agri-teal text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Simple billing for farmers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Plans That Grow{" "}
            <span className="gradient-text">With Your Farm</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start with a 7-day free trial. Upgrade when you need unlimited AI diagnosis,
            voice help in your language, and market tools — affordable across the region.
          </p>
        </motion.div>

        <motion.div className="grid gap-6 lg:grid-cols-3 lg:gap-8 items-stretch">
          {BILLING_PLANS.map((plan, index) => {
            const Icon = PLAN_ICONS[plan.id]
            const isHighlight = plan.highlighted

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 sm:p-8 shadow-sm transition-shadow duration-300",
                  isHighlight
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20 lg:scale-[1.02] z-10"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                )}
              >
                {plan.badge ? (
                  <span
                    className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
                      isHighlight
                        ? "bg-primary text-primary-foreground"
                        : plan.id === "yearly"
                          ? "bg-agri-teal text-white"
                          : "bg-muted text-foreground"
                    )}
                  >
                    {plan.badge}
                  </span>
                ) : null}

                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      isHighlight
                        ? "bg-primary text-primary-foreground"
                        : plan.id === "yearly"
                          ? "bg-agri-teal text-white"
                          : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                <div className="mb-6 border-b border-border pb-6">
                  <p className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.priceLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.period}</p>
                  {plan.savings ? (
                    <p className="mt-2 text-sm font-medium text-agri-teal">{plan.savings}</p>
                  ) : null}
                  {plan.id === "trial" ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No card required to start
                    </p>
                  ) : null}
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isHighlight ? "text-primary" : "text-agri-teal"
                        )}
                        aria-hidden
                      />
                      <span className="text-muted-foreground leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={cn(
                    "w-full",
                    isHighlight && "shadow-md",
                    plan.id === "yearly" &&
                      !isHighlight &&
                      "bg-agri-teal hover:bg-agri-teal/90 text-white"
                  )}
                  variant={plan.id === "trial" ? "outline" : "default"}
                  asChild
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto"
        >
          All plans include secure login, crop tracking, and AI tools built for
          farmers across South Asia. Prices in LKR. Cancel anytime on paid
          plans. Need help choosing?{" "}
          <Link
            href="https://wa.me/94772117131"
            className="font-medium text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp our team
          </Link>
          .
        </motion.p>
      </div>
    </section>
  )
}
