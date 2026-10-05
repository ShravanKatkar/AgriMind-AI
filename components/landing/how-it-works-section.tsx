"use client"

import { motion } from "framer-motion"
import { Camera, Sparkles, FileText, Bell, CheckCircle } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Capture or Describe",
    description: "Take a photo of your crop or describe the problem using voice or text in your language.",
    color: "bg-primary",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Analyzes",
    description: "Our AI instantly identifies diseases, pests, nutrient deficiencies, and provides a diagnosis.",
    color: "bg-accent",
  },
  {
    step: "03",
    icon: FileText,
    title: "Get Treatment Plan",
    description: "Receive a step-by-step treatment guide with costs, timelines, and prevention methods.",
    color: "bg-chart-3",
  },
  {
    step: "04",
    icon: Bell,
    title: "Track & Follow Up",
    description: "Set reminders and let AI track your progress until the issue is fully resolved.",
    color: "bg-chart-4",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-16"
        >
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Simple Process
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          How AgriMind AI{" "}
          <span className="gradient-text">Works</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Get from problem to solution in minutes, not days. Our AI never abandons you
          until your issue is fully resolved.
        </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative z-10 mb-6">
                  <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{item.step}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result Card */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-chart-3/10 rounded-3xl p-8 border border-border"
        >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Issue Resolved Successfully
              </h3>
              <p className="text-muted-foreground">
                AI continues monitoring until your crop is healthy again
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Recovery Rate</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-bold text-accent">2-3 Days</div>
              <div className="text-sm text-muted-foreground">Avg. Resolution</div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  )
}
