"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const stories = [
  {
    name: "Sunil Perera",
    location: "Anuradhapura",
    crop: "Rice & Tomato",
    quote: "AgriMind detected blight on my tomatoes before it spread. Saved my entire harvest.",
  },
  {
    name: "Kamala Shinde",
    location: "Kolhapur",
    crop: "Chili",
    quote: "I ask questions in Marathi and get answers instantly. Like having an expert in my pocket.",
  },
  {
    name: "Nimal Fernando",
    location: "Kandy",
    crop: "Tea",
    quote: "The reminders and weather alerts helped me plan fertilizer at the perfect time.",
  },
]

export function StoriesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Farmer Success Stories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real results from farmers across the region
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <Quote className="h-8 w-8 text-primary/40 mb-4" />
              <p className="text-foreground leading-relaxed mb-6">&ldquo;{story.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-foreground">{story.name}</p>
                <p className="text-sm text-muted-foreground">
                  {story.location} · {story.crop}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
