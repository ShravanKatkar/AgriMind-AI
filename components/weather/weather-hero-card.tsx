"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, CloudSun, CloudRain } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TypingText } from "@/components/ui/typing-text"
import { TypingCursorLine } from "@/components/ui/typing-cursor-line"
import { getWeatherTimeTheme } from "@/lib/weather/time-theme"
import type { LucideIcon } from "lucide-react"

type StatItem = { icon: LucideIcon; label: string }

interface WeatherHeroCardProps {
  locationName: string
  temperature: number
  condition: string
  feelsLike: number
  windDirection?: string
  iconUrl?: string
  isDaytime?: boolean
  statItems: StatItem[]
  /** Rotating farming tips shown with typewriter animation */
  insightPhrases?: string[]
}

function RainOverlay() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-0.5 rounded-full bg-sky-300/70"
          style={{
            left: `${(i * 17) % 100}%`,
            height: `${12 + (i % 4) * 6}px`,
            top: "-10%",
          }}
          animate={{ y: ["0%", "120%"], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 0.9 + (i % 5) * 0.15,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  )
}

export function WeatherHeroCard({
  locationName,
  temperature,
  condition,
  feelsLike,
  windDirection,
  iconUrl,
  isDaytime,
  statItems,
  insightPhrases = [],
}: WeatherHeroCardProps) {
  const [conditionTyped, setConditionTyped] = useState(false)

  useEffect(() => {
    setConditionTyped(false)
  }, [locationName, condition])

  const theme = getWeatherTimeTheme({
    isDaytime,
    condition,
  })

  const isNight = theme.period === "night"
  const mutedText = isNight ? "text-white/80" : "text-muted-foreground"

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0 relative min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme.period}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={theme.image}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div
              className="absolute inset-0"
              style={{ background: theme.overlay }}
            />
          </motion.div>
        </AnimatePresence>

        {theme.rainy && <RainOverlay />}

        <motion.div
          className="absolute -right-6 -top-6 h-36 w-36 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.glowColor }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-4 right-4 z-10 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md ${
            isNight
              ? "bg-white/20 text-white border border-white/25"
              : "bg-white/60 text-foreground border border-white/50"
          }`}
        >
          {theme.label}
          {theme.rainy ? " · Rainy" : ""}
        </motion.span>

        <motion.div className="relative z-10 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className={theme.textClass}>
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-sm flex items-center gap-1 ${mutedText}`}
              >
                <MapPin className="h-4 w-4" />
                {locationName}
              </motion.p>
              <motion.p
                key={temperature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="text-5xl font-bold mt-2 drop-shadow-sm"
              >
                {temperature}°C
              </motion.p>
              <p
                className={`capitalize mt-1 font-medium min-h-[1.5rem] ${isNight ? "text-white/95" : ""}`}
              >
                <TypingText
                  key={`${locationName}-${condition}`}
                  text={condition}
                  speedMs={38}
                  startDelayMs={320}
                  onComplete={() => setConditionTyped(true)}
                />
              </p>
              {insightPhrases.length > 0 && (
                <TypingCursorLine
                  key={insightPhrases.join("|")}
                  phrases={insightPhrases}
                  className={`text-sm mt-1.5 italic ${mutedText}`}
                  typingMs={36}
                  pauseMs={3200}
                />
              )}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={
                  conditionTyped || insightPhrases.length === 0
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 4 }
                }
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`text-sm mt-1 ${mutedText}`}
              >
                Feels like {feelsLike}°C
                {windDirection
                  ? ` · Wind ${windDirection.replace(/_/g, " ")}`
                  : ""}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.15 }}
            >
              {iconUrl ? (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="drop-shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${iconUrl}.png`}
                    alt=""
                    className="h-20 w-20"
                  />
                </motion.div>
              ) : theme.rainy ? (
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <CloudRain
                    className={`h-20 w-20 ${isNight ? "text-sky-200" : "text-sky-600"}`}
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <CloudSun
                    className={`h-20 w-20 ${isNight ? "text-amber-200" : "text-amber-500"}`}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
            }}
          >
            {statItems.map((item) => (
              <motion.div
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                className={`flex items-center gap-2 text-sm rounded-full px-3 py-2 shadow-sm ${theme.statPillClass}`}
              >
                <item.icon
                  className={`h-4 w-4 shrink-0 ${isNight ? "text-emerald-300" : "text-primary"}`}
                />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
