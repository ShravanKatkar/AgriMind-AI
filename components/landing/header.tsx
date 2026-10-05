"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { AgriMindLogo } from "@/components/brand/agrimind-logo"
import { Button } from "@/components/ui/button"
import { ThemeToggle, ThemeToggleRow } from "@/components/layout/theme-toggle"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Crops", href: "#crops" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobileMenuOpen])

  const mobileMenu = mounted
    ? createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[2px] md:hidden"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.nav
                id="mobile-nav-menu"
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-[4.25rem] right-3 z-[101] flex w-[min(17.5rem,calc(100vw-1.5rem))] max-h-[min(28rem,calc(100dvh-5.5rem))] flex-col overflow-y-auto rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-lg md:hidden"
                aria-label="Mobile navigation"
              >
                <div className="space-y-0.5 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div
                    className="mt-2 space-y-2.5 border-t border-border pt-3"
                    data-no-translate
                  >
                    <ThemeToggleRow onToggle={() => setIsMobileMenuOpen(false)} />
                    <LanguagePicker contentClassName="z-[110]" />
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/login">Get Started</Link>
                    </Button>
                  </div>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || isMobileMenuOpen
            ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <AgriMindLogo size="lg" priority />

            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex" data-no-translate>
              <LanguagePicker />
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="p-2 text-foreground md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileMenu}
    </>
  )
}
