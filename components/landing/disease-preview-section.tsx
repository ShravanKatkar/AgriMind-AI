"use client"

import { motion } from "framer-motion"
import { Camera, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function DiseasePreviewSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Camera className="h-4 w-4" />
            AI Crop Diagnosis
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Instant Disease Detection
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a photo and get disease name, confidence score, treatment plan, and recovery timeline.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 max-w-3xl mx-auto"
        >
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-primary/20 bg-black shadow-lg">
              <video
                className="h-full w-full object-cover"
                src="/videos/crop-diagnosis-preview.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Farmer using smartphone for crop disease detection"
              />
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">Early Blight</span>
                  <span className="text-sm text-primary font-medium">92% confidence</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Severity: <strong className="text-foreground">Moderate</strong></span>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
                <p className="font-medium text-foreground">Treatment Plan</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Apply copper-based fungicide</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Improve air circulation</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Remove infected leaves</li>
                </ul>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Recovery: 2-3 weeks
                </span>
                <span className="text-muted-foreground">Est. cost: LKR 2,500</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
