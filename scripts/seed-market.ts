/**
 * Seed or refresh Sri Lanka market price reference data in MongoDB.
 *
 * Usage (from project root, with MONGODB_URI in .env.local):
 *   npx tsx --env-file=.env.local scripts/seed-market.ts
 *
 * Pass --force to drop and re-insert all market crops.
 */

import mongoose from "mongoose"
import { connectDB } from "../lib/mongodb"
import { MARKET_CROP_SEEDS } from "../lib/market/seed-data"

const force = process.argv.includes("--force")

function computeTrend(changePercent: number): "up" | "down" | "stable" {
  if (changePercent > 1) return "up"
  if (changePercent < -1) return "down"
  return "stable"
}

async function main() {
  await connectDB()

  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true },
      nameSi: String,
      unit: String,
      price: Number,
      previousPrice: Number,
      change: Number,
      changePercent: Number,
      trend: String,
      demandLevel: String,
      location: String,
      market: String,
      forecast: String,
      history: [{ label: String, price: Number }],
      lastUpdated: Date,
    },
    { timestamps: true }
  )

  const MarketCrop =
    mongoose.models.MarketCrop ?? mongoose.model("MarketCrop", schema)

  if (force) {
    await MarketCrop.deleteMany({})
    console.log("Cleared existing market crops.")
  }

  let upserted = 0
  for (const s of MARKET_CROP_SEEDS) {
    const change = s.price - s.previousPrice
    const changePercent =
      s.previousPrice === 0 ? 0 : Math.round((change / s.previousPrice) * 1000) / 10

    await MarketCrop.findOneAndUpdate(
      { name: s.name },
      {
        $set: {
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
        },
      },
      { upsert: true }
    )
    upserted++
  }

  console.log(`Market seed complete: ${upserted} crops upserted.`)

  const locSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true },
      demand: String,
      crops: [String],
      lastUpdated: Date,
      priceSource: String,
    },
    { timestamps: true }
  )

  const MarketLocation =
    mongoose.models.MarketLocation ??
    mongoose.model("MarketLocation", locSchema)

  if (force) {
    await MarketLocation.deleteMany({})
    console.log("Cleared existing market locations.")
  }

  const { MARKET_LOCATIONS } = await import("../lib/market/seed-data")
  for (const loc of MARKET_LOCATIONS) {
    await MarketLocation.findOneAndUpdate(
      { name: loc.name },
      {
        $set: {
          name: loc.name,
          demand: loc.demand,
          crops: loc.crops,
          lastUpdated: new Date(),
          priceSource: "seed",
        },
      },
      { upsert: true }
    )
  }
  console.log(`Market locations seed complete: ${MARKET_LOCATIONS.length} Indian hubs upserted.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
