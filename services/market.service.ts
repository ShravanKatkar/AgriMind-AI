import { connectDB } from "@/lib/mongodb"
import { MARKET_CROP_SEEDS, MARKET_LOCATIONS } from "@/lib/market/seed-data"
import {
  buildMarketPricePrompt,
  AiMarketResponseSchema,
} from "@/lib/market/ai-prices"
import { deriveMarketLocationsFromCrops } from "@/lib/market/locations"
import type { MarketLocationView } from "@/lib/market/locations"
import {
  MARKET_PRICE_SOURCE,
  MARKET_PRICE_STALE_MS,
} from "@/lib/market/constants"
import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import MarketCrop, { type IMarketCrop } from "@/models/MarketCrop"
import MarketLocation from "@/models/MarketLocation"
import MarketAlert, { type IMarketAlert } from "@/models/MarketAlert"
import { createNotification } from "@/services/notification.service"
import { deepStripAsterisks } from "@/lib/chat/clean-text"

function computeTrend(changePercent: number): "up" | "down" | "stable" {
  if (changePercent > 1) return "up"
  if (changePercent < -1) return "down"
  return "stable"
}

export async function seedMarketDataIfEmpty(): Promise<void> {
  await connectDB()
  const count = await MarketCrop.countDocuments()
  if (count > 0) return

  const docs = MARKET_CROP_SEEDS.map((s) => {
    const change = s.price - s.previousPrice
    const changePercent =
      s.previousPrice === 0 ? 0 : Math.round((change / s.previousPrice) * 1000) / 10
    return {
      name: s.name,
      nameSi: s.nameSi,
      unit: s.unit,
      price: s.price,
      previousPrice: s.previousPrice,
      change,
      changePercent,
      trend: computeTrend(changePercent),
      demandLevel: s.demandLevel,
      location: s.location,
      market: s.market,
      forecast: s.forecast,
      history: s.history,
      lastUpdated: new Date(),
    }
  })

  await MarketCrop.insertMany(docs)
}

export async function getMarketPrices(): Promise<IMarketCrop[]> {
  try {
    await connectDB()
    await seedMarketDataIfEmpty()
    const crops = await MarketCrop.find().sort({ name: 1 }).lean()
    if (crops.length > 0) return crops as IMarketCrop[]
  } catch (err) {
    console.warn("[market.service] DB unavailable, showing seed market prices:", (err as Error).message)
  }

  return MARKET_CROP_SEEDS.map((s, idx) => {
    const change = s.price - s.previousPrice
    const changePercent =
      s.previousPrice === 0 ? 0 : Math.round((change / s.previousPrice) * 1000) / 10
    return {
      _id: `sample-market-${idx}` as unknown,
      name: s.name,
      nameSi: s.nameSi,
      unit: s.unit,
      price: s.price,
      previousPrice: s.previousPrice,
      change,
      changePercent,
      trend: computeTrend(changePercent),
      demandLevel: s.demandLevel,
      location: s.location,
      market: s.market,
      forecast: s.forecast,
      history: s.history,
      lastUpdated: new Date(),
    } as unknown as IMarketCrop
  })
}

export function isMarketDataStale(lastUpdated?: Date | null): boolean {
  if (!lastUpdated) return true
  return Date.now() - new Date(lastUpdated).getTime() > MARKET_PRICE_STALE_MS
}

export function getMarketMeta(prices: IMarketCrop[]) {
  const latest = prices.reduce<Date | null>((max, c) => {
    const d = c.lastUpdated ? new Date(c.lastUpdated) : null
    if (!d) return max
    return !max || d > max ? d : max
  }, null)

  const hasAi = prices.some((p) => p.priceSource === MARKET_PRICE_SOURCE.ai)
  const dataAsOf = prices.find((p) => p.dataAsOf)?.dataAsOf

  return {
    lastUpdated: latest,
    stale: isMarketDataStale(latest),
    priceSource: hasAi ? MARKET_PRICE_SOURCE.ai : MARKET_PRICE_SOURCE.seed,
    dataAsOf,
    openAiConfigured: Boolean(openaiConfig.apiKey),
  }
}

function rollHistory(
  history: { label: string; price: number }[],
  newPrice: number
): { label: string; price: number }[] {
  const label = new Date().toLocaleString("en-US", { month: "short" })
  const next = [...(history ?? [])]
  const last = next[next.length - 1]
  if (last?.label === label) {
    next[next.length - 1] = { label, price: newPrice }
  } else {
    next.push({ label, price: newPrice })
    if (next.length > 5) next.shift()
  }
  return next
}

/** Refresh wholesale prices using OpenAI estimates (not a live government feed). */
export async function refreshMarketPricesFromAI(): Promise<{
  updated: number
  asOf: string
  disclaimer?: string
  locationsUpdated?: number
}> {
  await connectDB()
  await seedMarketDataIfEmpty()

  const existing = await MarketCrop.find().sort({ name: 1 }).lean()
  if (existing.length === 0) {
    throw new Error("No market crops in database")
  }

  const cropNames = existing.map((c) => c.name)
  const summary = existing
    .map((c) => `${c.name}: Rs.${c.price}/${c.unit} at ${c.location} (${c.changePercent}%)`)
    .join("\n")

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: openaiConfig.chatModel,
    temperature: 0.35,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You output realistic Indian wholesale APMC crop price estimates as strict JSON only.",
      },
      {
        role: "user",
        content: buildMarketPricePrompt(cropNames, summary),
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error("Empty response from OpenAI")

  const parsed = AiMarketResponseSchema.safeParse(JSON.parse(raw))
  if (!parsed.success) {
    throw new Error("Invalid market price format from OpenAI")
  }

  const { asOf, disclaimer, crops: aiCrops } = parsed.data
  const byName = new Map(aiCrops.map((c) => [c.name.toLowerCase(), c]))
  let updated = 0

  for (const doc of existing) {
    const ai = byName.get(doc.name.toLowerCase())
    if (!ai) continue

    const previousPrice = doc.price
    const price = Math.round(ai.price)
    const change = price - previousPrice
    const changePercent =
      previousPrice === 0
        ? 0
        : Math.round((change / previousPrice) * 1000) / 10

    await MarketCrop.updateOne(
      { _id: doc._id },
      {
        $set: {
          price,
          previousPrice,
          change,
          changePercent:
            ai.changePercent !== undefined
              ? Math.round(ai.changePercent * 10) / 10
              : changePercent,
          trend: computeTrend(
            ai.changePercent !== undefined ? ai.changePercent : changePercent
          ),
          unit: ai.unit,
          location: ai.location,
          market: ai.market,
          demandLevel: ai.demandLevel,
          forecast: ai.forecast,
          history: rollHistory(doc.history ?? [], price),
          lastUpdated: new Date(),
          priceSource: MARKET_PRICE_SOURCE.ai,
          dataAsOf: asOf,
        },
      }
    )
    updated++
  }

  if (updated === 0) {
    throw new Error("OpenAI did not return matching crop names")
  }

  const refreshedCrops = await MarketCrop.find().sort({ name: 1 }).lean()
  const locations =
    parsed.data.locations?.length &&
    parsed.data.locations.length >= 3
      ? parsed.data.locations
      : deriveMarketLocationsFromCrops(refreshedCrops)

  await saveMarketLocations(locations, MARKET_PRICE_SOURCE.ai)

  return { updated, asOf, disclaimer, locationsUpdated: locations.length }
}

async function saveMarketLocations(
  locations: MarketLocationView[],
  source: (typeof MARKET_PRICE_SOURCE)[keyof typeof MARKET_PRICE_SOURCE]
) {
  const now = new Date()
  for (const loc of locations) {
    await MarketLocation.findOneAndUpdate(
      { name: loc.name },
      {
        $set: {
          demand: loc.demand,
          crops: loc.crops,
          lastUpdated: now,
          priceSource: source,
        },
      },
      { upsert: true }
    )
  }
}

async function seedMarketLocationsIfEmpty() {
  const count = await MarketLocation.countDocuments()
  if (count > 0) return
  await saveMarketLocations(
    MARKET_LOCATIONS.map((l) => ({
      name: l.name,
      demand: l.demand as MarketLocationView["demand"],
      crops: l.crops,
    })),
    MARKET_PRICE_SOURCE.seed
  )
}

export async function getMarketCrop(name: string): Promise<IMarketCrop | null> {
  await connectDB()
  await seedMarketDataIfEmpty()
  return MarketCrop.findOne({ name: new RegExp(`^${name}$`, "i") }).lean()
}

export async function getMarketLocations(): Promise<MarketLocationView[]> {
  await connectDB()
  await seedMarketDataIfEmpty()
  const crops = await MarketCrop.find().sort({ name: 1 }).lean()

  const hasAiPrices = crops.some((c) => c.priceSource === MARKET_PRICE_SOURCE.ai)
  if (hasAiPrices) {
    return deriveMarketLocationsFromCrops(crops)
  }

  await seedMarketLocationsIfEmpty()
  const stored = await MarketLocation.find().sort({ name: 1 }).lean()
  if (stored.length > 0) {
    return stored.map((l) => ({
      name: l.name,
      demand: l.demand as MarketLocationView["demand"],
      crops: l.crops ?? [],
    }))
  }

  return deriveMarketLocationsFromCrops(crops)
}

export async function getChartHistory(cropNames?: string[]) {
  const crops = await getMarketPrices()
  const filtered = cropNames?.length
    ? crops.filter((c) =>
        cropNames.some((n) => n.toLowerCase() === c.name.toLowerCase())
      )
    : crops.slice(0, 4)

  if (filtered.length === 0) return []

  const labels = filtered[0]?.history?.map((h) => h.label) ?? []
  return labels.map((label, i) => {
    const point: Record<string, string | number> = { date: label }
    for (const crop of filtered) {
      const key = crop.name.toLowerCase().replace(/\s+/g, "_")
      point[key] = crop.history?.[i]?.price ?? 0
    }
    return point
  })
}

export interface MarketInsight {
  title: string
  description: string
  type: "opportunity" | "warning" | "info"
}

export async function generateMarketInsights(
  primaryCrops?: string[]
): Promise<MarketInsight[]> {
  const crops = await getMarketPrices()
  const summary = crops
    .map(
      (c) =>
        `${c.name}: Rs.${c.price}/${c.unit} (${c.changePercent}% ${c.trend}), demand ${c.demandLevel}, ${c.location}`
    )
    .join("\n")

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: openaiConfig.chatModel,
    temperature: 0.7,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are AgriMind AI market analyst for Indian farmers.
Return JSON: { "insights": [{ "title": string, "description": string, "type": "opportunity"|"warning"|"info" }] }
Provide exactly 3 insights in simple English. Focus on sell timing, planting decisions, and demand.
CRITICAL: Never use asterisks (*) or (**) in title or description.`,
      },
      {
        role: "user",
        content: `Current market data:\n${summary}\n\nFarmer grows: ${primaryCrops?.join(", ") || "mixed vegetables"}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return deepStripAsterisks(fallbackInsights(crops))

  try {
    const parsed = JSON.parse(raw) as { insights?: MarketInsight[] }
    const result = parsed.insights?.slice(0, 3) ?? fallbackInsights(crops)
    return deepStripAsterisks(result)
  } catch {
    return deepStripAsterisks(fallbackInsights(crops))
  }
}

function fallbackInsights(crops: IMarketCrop[]): MarketInsight[] {
  const top = [...crops].sort((a, b) => b.changePercent - a.changePercent)[0]
  const low = [...crops].sort((a, b) => a.changePercent - b.changePercent)[0]
  return [
    {
      title: top ? `Strong demand for ${top.name}` : "Market update",
      description: top?.forecast ?? "Check local wholesale APMC prices before selling.",
      type: "opportunity",
    },
    {
      title: low ? `Watch ${low.name} prices` : "Price caution",
      description: low?.forecast ?? "Prices may soften — plan harvest timing carefully.",
      type: "warning",
    },
    {
      title: "Pune & Nashik APMC hubs",
      description:
        "Compare Pune and Nashik APMC Mandi rates with your local district buyers before bulk sale.",
      type: "info",
    },
  ]
}

export async function createMarketAlert(input: {
  firebaseUid: string
  cropName: string
  condition: "above" | "below"
  targetPrice: number
}): Promise<IMarketAlert> {
  await connectDB()
  return MarketAlert.create(input)
}

export async function listMarketAlerts(firebaseUid: string): Promise<IMarketAlert[]> {
  await connectDB()
  return MarketAlert.find({ firebaseUid, active: true }).lean()
}

export async function processMarketAlerts(firebaseUid: string): Promise<number> {
  await connectDB()
  const alerts = await MarketAlert.find({ firebaseUid, active: true })
  let triggered = 0

  for (const alert of alerts) {
    const crop = await getMarketCrop(alert.cropName)
    if (!crop) continue

    const hit =
      alert.condition === "above"
        ? crop.price >= alert.targetPrice
        : crop.price <= alert.targetPrice

    if (!hit) continue

    await createNotification({
      firebaseUid,
      type: "crop",
      title: `Price alert: ${crop.name}`,
      message: `${crop.name} is now Rs.${crop.price}/${crop.unit} (${alert.condition} your target Rs.${alert.targetPrice})`,
      link: "/dashboard/market",
      metadata: { alertId: String(alert._id), crop: crop.name },
    })

    await MarketAlert.updateOne(
      { _id: alert._id },
      { $set: { active: false, triggeredAt: new Date() } }
    )
    triggered++
  }

  return triggered
}
