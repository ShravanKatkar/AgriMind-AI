"use client"

import { motion } from "framer-motion"
import { getPasswordStrength } from "@/lib/password-strength"
import { cn } from "@/lib/utils"

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null

  const { score, label, color } = getPasswordStrength(password)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-1.5"
    >
      <motion.div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.div>
      <p className="text-xs text-muted-foreground capitalize">
        Password strength: <span className="font-medium text-foreground">{label}</span>
      </p>
    </motion.div>
  )
}
