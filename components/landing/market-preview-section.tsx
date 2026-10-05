"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

const prices = [
  { crop: "Tomato", price: "₹ 32/kg", change: "+12%", up: true },
  { crop: "Rice", price: "₹ 58/kg", change: "+3%", up: true },
  { crop: "Chili", price: "₹ 75/kg", change: "-5%", up: false },
  { crop: "Onion", price: "₹ 26/kg", change: "+8%", up: true },
]

export function MarketPreviewSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-4">
            <BarChart3 className="h-4 w-4" />
            Market Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Real-Time Market Prices
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Track prices, demand trends, and sell at the right time — full analytics in Phase 5.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prices.map((item, i) => (
            <motion.div
              key={item.crop}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5 border border-border/50"
            >
              <p className="text-sm text-muted-foreground">{item.crop}</p>
              <p className="text-xl font-bold text-foreground mt-1">{item.price}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${item.up ? "text-primary" : "text-destructive"}`}>
                {item.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {item.change}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
