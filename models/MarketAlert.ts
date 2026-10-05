import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IMarketAlert extends Document {
  firebaseUid: string
  cropName: string
  condition: "above" | "below"
  targetPrice: number
  active: boolean
  triggeredAt?: Date
  createdAt: Date
  updatedAt: Date
}

const MarketAlertSchema = new Schema<IMarketAlert>(
  {
    firebaseUid: { type: String, required: true, index: true },
    cropName: { type: String, required: true },
    condition: { type: String, enum: ["above", "below"], required: true },
    targetPrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
    triggeredAt: Date,
  },
  { timestamps: true }
)

MarketAlertSchema.index({ firebaseUid: 1, active: 1 })

const MarketAlert: Model<IMarketAlert> =
  mongoose.models.MarketAlert ??
  mongoose.model<IMarketAlert>("MarketAlert", MarketAlertSchema)

export default MarketAlert
