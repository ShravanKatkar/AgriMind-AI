"use client"

import { motion } from "framer-motion"
import { Leaf } from "lucide-react"

const crops = [
  { name: "Rice", hindi: "चावल / धान", marathi: "तांदूळ / भात", emoji: "🌾" },
  { name: "Tea", hindi: "चाय", marathi: "चहा", emoji: "🍵" },
  { name: "Coconut", hindi: "नारियल", marathi: "नारळ", emoji: "🥥" },
  { name: "Tomato", hindi: "टमाटर", marathi: "टोमॅटो", emoji: "🍅" },
  { name: "Chili", hindi: "मिर्च", marathi: "मिरची", emoji: "🌶️" },
  { name: "Onion", hindi: "प्याज", marathi: "कांदा", emoji: "🧅" },
  { name: "Banana", hindi: "केला", marathi: "केळी", emoji: "🍌" },
  { name: "Corn", hindi: "मक्का", marathi: "मका", emoji: "🌽" },
  { name: "Carrot", hindi: "गाजर", marathi: "गाजर", emoji: "🥕" },
  { name: "Potato", hindi: "आलू", marathi: "बटाटा", emoji: "🥔" },
  { name: "Cabbage", hindi: "पत्तागोभी", marathi: "कोबी", emoji: "🥬" },
  { name: "Papaya", hindi: "पपीता", marathi: "पपई", emoji: "🍈" },
]

export function CropsSection() {
  return (
    <section id="crops" className="py-24 bg-muted/30">
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
            Supported Crops
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            AI Support For{" "}
            <span className="gradient-text">All Major Crops</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AgriMind AI covers tropical and staple crops common across farming regions —
            rice, coconut, chili, vegetables, and more — with local treatment
            guidance for your fields.
          </p>
        </motion.div>

        {/* Crops Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {crops.map((crop, index) => (
            <motion.div
              key={crop.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="group cursor-pointer"
            >
              <div className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 text-center">
                <div className="text-4xl mb-3">{crop.emoji}</div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {crop.name}
                </h3>
                <div className="mt-1 space-y-0.5">
                  <p className="text-xs text-muted-foreground">{crop.hindi}</p>
                  <p className="text-xs text-muted-foreground">{crop.marathi}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* More Crops Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              And many more crops being added regularly
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
