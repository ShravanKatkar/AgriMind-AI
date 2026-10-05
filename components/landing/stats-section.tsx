"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

const stats = [
  { value: 10000, suffix: "+", label: "Active Farmers" },
  { value: 95, suffix: "%", label: "Diagnosis Accuracy" },
  { value: 9, suffix: "", label: "Supported Crops" },
  { value: 24, suffix: "/7", label: "AI Availability" },
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: "easeOut" })
    return controls.stop
  }, [count, value])

  return (
    <span className="text-4xl sm:text-5xl font-bold gradient-text">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
