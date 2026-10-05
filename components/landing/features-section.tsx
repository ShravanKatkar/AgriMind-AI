"use client"

import { motion } from "framer-motion"
import { 
  Camera, 
  Mic, 
  LineChart, 
  CloudSun, 
  Bell, 
  MessageSquare,
  FileText,
  Youtube,
  Map,
  Users,
  Sprout,
  Shield
} from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "AI Disease Detection",
    description: "Upload crop photos for instant AI-powered disease identification with treatment recommendations.",
    color: "bg-primary",
  },
  {
    icon: Mic,
    title: "Voice Assistant",
    description:
      "Speak naturally in Hindi, Marathi, or English. Get voice replies and guidance for your farm.",
    color: "bg-accent",
  },
  {
    icon: Sprout,
    title: "Crop Journey Tracker",
    description: "Track your crops from planting to harvest with AI-guided milestones and reminders.",
    color: "bg-chart-3",
  },
  {
    icon: LineChart,
    title: "Market Intelligence",
    description: "Real-time crop prices, demand forecasts, and AI selling recommendations.",
    color: "bg-chart-4",
  },
  {
    icon: CloudSun,
    title: "Weather Alerts",
    description: "Get timely weather warnings and understand how conditions affect your crops.",
    color: "bg-chart-5",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Automated reminders for watering, fertilizing, spraying, and harvesting via SMS or WhatsApp.",
    color: "bg-destructive",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "24/7 intelligent farming assistant that remembers your history and provides contextual help.",
    color: "bg-primary",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description: "Generate downloadable treatment plans and farming guides in your preferred language.",
    color: "bg-accent",
  },
  {
    icon: Youtube,
    title: "Video Learning",
    description: "Curated YouTube tutorials matched to your crops and current challenges.",
    color: "bg-chart-3",
  },
  {
    icon: Map,
    title: "Local Suppliers",
    description: "Find nearby agricultural suppliers, machinery rentals, and expert officers.",
    color: "bg-chart-4",
  },
  {
    icon: Users,
    title: "WhatsApp Support",
    description: "Connect directly with agriculture officers for human support when needed.",
    color: "bg-chart-5",
  },
  {
    icon: Shield,
    title: "Offline Mode",
    description: "Core features work even with limited connectivity for remote farming areas.",
    color: "bg-muted-foreground",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
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
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need For{" "}
            <span className="gradient-text">Smart Farming</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From disease detection to market insights, AgriMind AI provides comprehensive 
            tools to help you grow better crops and earn more.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
