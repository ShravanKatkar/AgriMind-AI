"use client"

import { motion } from "framer-motion"
import { useHideOnScrollDown } from "@/hooks/use-hide-on-scroll-down"
import { cn } from "@/lib/utils"

type ScrollHideBarProps = {
  children: React.ReactNode
  className?: string
  /** Passed to useHideOnScrollDown */
  minScroll?: number
}

/** Collapses content when scrolling down; expands when scrolling back up */
export function ScrollHideBar({
  children,
  className,
  minScroll,
}: ScrollHideBarProps) {
  const visible = useHideOnScrollDown({ minScroll })

  return (
    <motion.div
      initial={false}
      animate={{
        height: visible ? "auto" : 0,
        opacity: visible ? 1 : 0,
        marginTop: visible ? 0 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn("overflow-hidden", className)}
      aria-hidden={!visible}
    >
      <motion.div
        animate={{ y: visible ? 0 : -12 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
