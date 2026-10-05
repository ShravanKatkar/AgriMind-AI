import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMarketLocation extends Document {
  name: string
  demand: string
  crops: string[]
  lastUpdated: Date
  priceSource?: "seed" | "ai_estimate"
}

const MarketLocationSchema = new Schema<IMarketLocation>(
  {
    name: { type: String, required: true, unique: true, index: true },
    demand: { type: String, required: true },
    crops: [String],
    lastUpdated: { type: Date, default: Date.now },
    priceSource: {
      type: String,
      enum: ["seed", "ai_estimate"],
      default: "seed",
    },
  },
  { timestamps: true }
)

const MarketLocation: Model<IMarketLocation> =
  mongoose.models.MarketLocation ??
  mongoose.model<IMarketLocation>("MarketLocation", MarketLocationSchema)

export default MarketLocation
