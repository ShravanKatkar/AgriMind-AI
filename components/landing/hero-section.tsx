"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Mic,
  Camera,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { SouthAsiaRegionsBar } from "@/components/landing/south-asia-regions-bar"
import { SOUTH_ASIA_VOICE_LANGUAGES_LABEL } from "@/lib/landing/regions"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] flex-col overflow-x-hidden"
    >
      <motion.div className="pointer-events-none absolute inset-0 gradient-bg" aria-hidden />
      <motion.div
        className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <motion.div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-2 pt-20 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <motion.div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 sm:mb-5"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI for South Asia</span>
            </motion.div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              Your AI Farming Partner{" "}
              <span className="gradient-text">From Seed To Harvest</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg lg:mx-0">
              AgriMind AI helps farmers with crop disease detection,
              voice support in Hindi, Marathi, and English, and smart farming
              guidance tailored to local seasons and crops.
            </p>

            <SouthAsiaRegionsBar className="mt-4 sm:mt-5" variant="hero" />

            <motion.div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4 lg:justify-start">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/login">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div className="mt-8 hidden items-center justify-center gap-6 sm:flex lg:justify-start">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground sm:text-2xl">10K+</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Active Farmers</div>
              </div>
              <div className="h-8 w-px bg-border sm:h-10" />
              <div className="text-center">
                <div className="text-xl font-bold text-foreground sm:text-2xl">95%</div>
                <div className="text-xs text-muted-foreground sm:text-sm">Accuracy Rate</div>
              </div>
              <div className="h-8 w-px bg-border sm:h-10" />
              <div className="text-center">
                <div className="text-xl font-bold text-foreground sm:text-2xl">24/7</div>
                <div className="text-xs text-muted-foreground sm:text-sm">AI Support</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="glass rounded-3xl p-4 shadow-2xl sm:p-5">
              <div className="space-y-3 rounded-2xl bg-background p-3 sm:space-y-4 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                    <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground sm:text-base">
                      AgriMind AI
                    </div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                </div>

                <div className="space-y-2.5 sm:min-h-[140px] sm:space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-primary-foreground sm:px-4">
                      <p className="text-xs sm:text-sm">
                        My tomato leaves are turning yellow with brown spots
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-muted px-3 py-2 sm:px-4 sm:py-3">
                      <p className="text-xs text-foreground sm:text-sm">
                        Based on your description, this appears to be{" "}
                        <span className="font-semibold text-primary">Early Blight</span>.
                        Can you upload a photo?
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-start"
                  >
                    <div className="rounded-2xl rounded-tl-md bg-muted px-3 py-2 sm:px-4 sm:py-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span className="text-muted-foreground">
                          Generating treatment plan...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-2">
                  <Camera className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
                  <span className="flex-1 truncate px-1 text-xs text-muted-foreground sm:text-sm">
                    Type or speak your question...
                  </span>
                  <div className="rounded-lg bg-primary p-1.5 sm:p-2">
                    <Mic className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute -top-3 -right-2 hidden rounded-2xl glass p-2.5 shadow-lg sm:block sm:-top-4 sm:-right-4 sm:p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary sm:h-8 sm:w-8">
                  <Mic className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-foreground sm:text-xs">
                    Voice Support
                  </div>
                  <div className="max-w-[7.5rem] text-[10px] leading-snug text-muted-foreground sm:max-w-none sm:text-xs">
                    {SOUTH_ASIA_VOICE_LANGUAGES_LABEL}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 }}
              className="absolute -bottom-3 -left-2 hidden rounded-2xl glass p-2.5 shadow-lg sm:block sm:-bottom-4 sm:-left-4 sm:p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary sm:h-8 sm:w-8">
                  <Camera className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-foreground sm:text-xs">
                    Photo Analysis
                  </div>
                  <div className="text-[10px] text-muted-foreground sm:text-xs">
                    AI Detection
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-20 flex shrink-0 justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      >
        <a
          href="#features"
          className="group flex flex-col items-center gap-1.5 rounded-full px-4 py-2 text-muted-foreground transition-colors hover:text-primary"
          aria-label="Scroll to explore features"
        >
          <span className="text-xs font-medium tracking-wide">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-primary/80 group-hover:text-primary" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  )
}
