"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthInputProps = {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: LucideIcon
  required?: boolean
  minLength?: number
  trailing?: React.ReactNode
}

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required,
  minLength,
  trailing,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <motion.div
        className={cn(
          "relative rounded-xl border bg-muted/30 transition-shadow",
          focused
            ? "border-primary/50 shadow-[0_0_0_3px_oklch(0.48_0.15_156/0.15),0_8px_24px_-8px_oklch(0.48_0.15_156/0.30)]"
            : "border-border/60 shadow-inner"
        )}
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-11 w-full rounded-xl bg-transparent py-2 pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground/70"
        />
        {trailing && (
          <motion.div className="absolute right-3 top-1/2 -translate-y-1/2">
            {trailing}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
