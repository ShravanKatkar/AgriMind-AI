"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What crops does AgriMind AI support?",
    a: "We support Rice, Tea, Coconut, Tomato, Chili, Onion, Banana, Corn, and Carrot — with more crops coming in future updates.",
  },
  {
    q: "Which languages are supported?",
    a: "AgriMind supports Hindi, Marathi, and English for both text and voice.",
  },
  {
    q: "Is AgriMind AI free to use?",
    a: "Start with a 7-day free trial (no card required). Choose the 30-day plan (Rs. 790) for unlimited AI diagnosis and reminders, or the 1-year plan (Rs. 6,990) for the best value. See the Pricing section on this page for full details.",
  },
  {
    q: "How accurate is the disease detection?",
    a: "Our AI achieves up to 95% accuracy on supported crops when clear photos are provided. Always consult local agriculture officers for critical decisions.",
  },
  {
    q: "Can I connect with agriculture officers?",
    a: "Yes! WhatsApp officer support and direct communication features will be available in Phase 5.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
