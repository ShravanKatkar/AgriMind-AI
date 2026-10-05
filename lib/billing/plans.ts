/** AgriMind AI subscription plans — LKR pricing for Sri Lankan farmers */

export type BillingPlanId = "trial" | "monthly" | "yearly"

export interface BillingPlan {
  id: BillingPlanId
  name: string
  tagline: string
  price: number
  priceLabel: string
  period: string
  periodDays: number
  badge?: string
  highlighted?: boolean
  savings?: string
  cta: string
  ctaHref: string
  features: string[]
}

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "trial",
    name: "Free Trial",
    tagline: "Try every core tool — no payment for 7 days",
    price: 0,
    priceLabel: "Rs. 0",
    period: "7 days",
    periodDays: 7,
    badge: "New farmers",
    cta: "Start Free Trial",
    ctaHref: "/login?plan=trial",
    features: [
      "Full dashboard access",
      "AI crop disease scan (up to 15 photos)",
      "Voice assistant — Hindi, Marathi & English",
      "Track up to 3 crop fields",
      "Live market prices & weather alerts",
      "Smart reminders (in-app)",
    ],
  },
  {
    id: "monthly",
    name: "30-Day Plan",
    tagline: "Best for active growing seasons",
    price: 790,
    priceLabel: "Rs. 790",
    period: "per 30 days",
    periodDays: 30,
    badge: "Most popular",
    highlighted: true,
    cta: "Get 30-Day Plan",
    ctaHref: "/login?plan=monthly",
    features: [
      "Everything in Free Trial",
      "Unlimited AI diagnosis & history",
      "Unlimited crop fields & lifecycle",
      "PDF treatment reports (download)",
      "WhatsApp & SMS reminder alerts",
      "AI chat with farming memory",
      "Market insights & price forecasts",
    ],
  },
  {
    id: "yearly",
    name: "1-Year Plan",
    tagline: "Lowest cost for serious farmers",
    price: 6990,
    priceLabel: "Rs. 6,990",
    period: "per year",
    periodDays: 365,
    badge: "Best value",
    savings: "Save Rs. 2,490 vs monthly",
    cta: "Get 1-Year Plan",
    ctaHref: "/login?plan=yearly",
    features: [
      "Everything in 30-Day Plan",
      "Priority WhatsApp officer support",
      "Early access to new crops & features",
      "Offline-friendly crop notes",
      "Seasonal farming calendar tips",
      "Dedicated account recovery support",
    ],
  },
]

export function getBillingPlan(id: BillingPlanId): BillingPlan | undefined {
  return BILLING_PLANS.find((p) => p.id === id)
}
