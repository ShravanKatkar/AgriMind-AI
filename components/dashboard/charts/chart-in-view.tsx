"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

type ChartInViewProps = {
  className?: string
  children: (inView: boolean) => React.ReactNode
}

/** Fires when chart enters viewport — replays bar rise animation on scroll or first paint */
export function ChartInView({ className, children }: ChartInViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, {
    once: true,
    amount: 0.35,
    margin: "-40px 0px -60px 0px",
  })

  return (
    <motion.div
      ref={ref}
      className={cn("h-[220px] w-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children(inView)}
    </motion.div>
  )
}
