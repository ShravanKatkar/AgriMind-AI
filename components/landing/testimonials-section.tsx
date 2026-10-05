"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sunil Perera",
    location: "Anuradhapura",
    role: "Rice Farmer",
    image: "/testimonials/farmer1.jpg",
    quote: "AgriMind AI saved my entire rice harvest. The disease detection caught a fungal infection early, and the treatment plan worked perfectly.",
    rating: 5,
    crop: "Rice",
  },
  {
    name: "Kamala Patil",
    location: "Nashik, Maharashtra",
    role: "Onion & Tomato Farmer",
    image: "/testimonials/farmer2.jpg",
    quote: "I can speak to the AI in Marathi and it understands everything! The voice feature is a blessing for farmers like me who struggle with typing.",
    rating: 5,
    crop: "Tomato",
  },
  {
    name: "Bandara Silva",
    location: "Pune, Maharashtra",
    role: "Vegetable Farmer",
    image: "/testimonials/farmer3.jpg",
    quote: "The market price predictions helped me sell my tomatoes at the right time. I earned 40% more than usual this season!",
    rating: 5,
    crop: "Vegetables",
  },
  {
    name: "Priya Sharma",
    location: "Indore, Madhya Pradesh",
    role: "Wheat & Soybean Farmer",
    image: "/testimonials/farmer4.jpg",
    quote:
      "Finally, technology that helps village farmers! Hindi voice support and a simple interface anyone can use.",
    rating: 5,
    crop: "Soybean",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-background">
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
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Trusted By{" "}
            <span className="gradient-text">10,000+ Farmers</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from farmers across South Asia who have transformed
            their farming with AgriMind AI.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow duration-300">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                {/* Quote Text */}
                <p className="text-foreground leading-relaxed mb-6">
                  {`"${testimonial.quote}"`}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {testimonial.crop}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "10K+", label: "Active Farmers" },
            { value: "50K+", label: "Issues Resolved" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-muted/50 rounded-2xl"
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
