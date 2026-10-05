"use client"

import { motion } from "framer-motion"
import { Mic, Volume2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VoiceWaveAnimation } from "@/components/dashboard/voice/voice-wave-animation"
import { LANDING_VOICE_SAMPLES } from "@/lib/landing/regions"

export function VoiceDemoSection() {
  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Mic className="h-4 w-4" />
            AI Voice Assistant
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Speak Naturally in <span className="gradient-text">Your Language</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Speak in Hindi, Marathi, or English — voice transcription and
            natural speech replies built for farmers.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_VOICE_SAMPLES.map((lang, i) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{lang.label}</span>
              </div>
              <p className="text-sm text-muted-foreground italic mb-6">
                &ldquo;{lang.sample}&rdquo;
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary"
                >
                  <Mic className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <VoiceWaveAnimation
                  variant="speaking"
                  barCount={12}
                  size="compact"
                  className="min-w-0 flex-1"
                />
                <Volume2 className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" className="gap-2" asChild>
            <Link href="/login">
              <Mic className="h-4 w-4" /> Try Voice Assistant
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
