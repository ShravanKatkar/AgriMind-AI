import { z } from "zod"

export const AiMarketCropSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  unit: z.string(),
  location: z.string(),
  market: z.string(),
  demandLevel: z.enum(["high", "medium", "low"]),
  forecast: z.string(),
  changePercent: z.number().optional(),
})

export const AiMarketLocationSchema = z.object({
  name: z.string(),
  demand: z.enum(["Very High", "High", "Medium", "Low"]),
  crops: z.array(z.string()).min(1),
})

export const AiMarketResponseSchema = z.object({
  asOf: z.string(),
  disclaimer: z.string().optional(),
  crops: z.array(AiMarketCropSchema).min(1),
  locations: z.array(AiMarketLocationSchema).optional(),
})

export type AiMarketCrop = z.infer<typeof AiMarketCropSchema>
export type AiMarketResponse = z.infer<typeof AiMarketResponseSchema>

export function buildMarketPricePrompt(cropNames: string[], currentSummary: string) {
  return `You are AgriMind AI — an Indian wholesale agricultural market analyst (APMC/Mandi).

Estimate CURRENT wholesale prices in Indian Rupees (₹ / INR) for these crops at realistic Indian wholesale hubs (Pune APMC, Lasalgaon/Nashik APMC, Vashi Navi Mumbai, Azadpur Mandi Delhi, Kolhapur APMC, etc.).

Rules:
- Use plausible wholesale prices for ${new Date().getFullYear()} (not supermarket retail).
- "changePercent" = estimated % change vs roughly one week ago (can be negative).
- Include EVERY crop in the list with the exact same "name" spelling.
- Units: kg, dozen, nut, or "kg green leaf" as appropriate per crop.

Crops to price: ${cropNames.join(", ")}

Current database reference (update toward today's market):
${currentSummary}

Return ONLY valid JSON:
{
  "asOf": "YYYY-MM-DD",
  "disclaimer": "One sentence that these are AI estimates, not live auction data",
  "crops": [
    {
      "name": "Tomato",
      "price": 280,
      "unit": "kg",
      "location": "Dambulla",
      "market": "Dambulla Economic Centre",
      "demandLevel": "high",
      "forecast": "Short forecast",
      "changePercent": 5.2
    }
  ],
  "locations": [
    {
      "name": "Colombo",
      "demand": "Very High",
      "crops": ["Tomato", "Onion", "Carrot"]
    },
    {
      "name": "Dambulla",
      "demand": "High",
      "crops": ["Tomato", "Cabbage", "Carrot"]
    }
  ]
}

Include exactly 5 locations: Colombo, Kandy, Galle, Dambulla, Jaffna — with demand based on current crop trends.`
}
