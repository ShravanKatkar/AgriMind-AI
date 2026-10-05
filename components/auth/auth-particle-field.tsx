"use client"

import { motion } from "framer-motion"

const SHAPES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: 4 + (i % 5) * 2,
  left: `${(i * 41) % 100}%`,
  top: `${(i * 29) % 100}%`,
  duration: 6 + (i % 7),
  delay: i * 0.15,
}))

export function AuthParticleField() {
  return (
    <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SHAPES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (p.id % 2 === 0 ? 15 : -15), 0],
            opacity: [0.15, 0.55, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: [0.45, 0, 0.55, 1],
          }}
        />
      ))}
      <motion.div
        className="absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[100px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-0 h-[380px] w-[380px] rounded-full bg-amber-400/20 blur-[90px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-300/15 blur-[80px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
