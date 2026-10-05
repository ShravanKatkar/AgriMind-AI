"use client"

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { useEffect } from "react"

export function AuthCursorGlow() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 120, damping: 28 })
  const springY = useSpring(y, { stiffness: 120, damping: 28 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [x, y])

  const background = useMotionTemplate`radial-gradient(600px circle at ${springX}px ${springY}px, oklch(0.48 0.16 156 / 0.15), transparent 65%)`

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background }}
      aria-hidden
    />
  )
}
