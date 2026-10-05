import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IPriceHistoryPoint {
  label: string
  price: number
}

export interface IMarketCrop extends Document {
  name: string
  nameSi: string
  unit: string
  price: number
  previousPrice: number
  change: number
  changePercent: number
  trend: "up" | "down" | "stable"
  demandLevel: "high" | "medium" | "low"
  location: string
  market: string
  forecast: string
  history: IPriceHistoryPoint[]
  lastUpdated: Date
  priceSource?: "seed" | "ai_estimate"
  dataAsOf?: string
}

const MarketCropSchema = new Schema<IMarketCrop>(
  {
    name: { type: String, required: true, unique: true, index: true },
    nameSi: String,
    unit: { type: String, default: "kg" },
    price: { type: Number, required: true },
    previousPrice: { type: Number, required: true },
    change: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },
    trend: { type: String, enum: ["up", "down", "stable"], default: "stable" },
    demandLevel: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    location: String,
    market: String,
    forecast: String,
    history: [
      {
        label: String,
        price: Number,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
    priceSource: {
      type: String,
      enum: ["seed", "ai_estimate"],
      default: "seed",
    },
    dataAsOf: String,
  },
  { timestamps: true }
)

const MarketCrop: Model<IMarketCrop> =
  mongoose.models.MarketCrop ??
  mongoose.model<IMarketCrop>("MarketCrop", MarketCropSchema)

export default MarketCrop
