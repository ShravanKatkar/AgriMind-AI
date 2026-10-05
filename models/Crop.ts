import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { CropStage, CropStatus } from "@/types/crop"

export interface ICrop extends Document {
  firebaseUid: string
  name: string
  cropType: string
  variety?: string
  stage: CropStage
  health: number
  plantedDate: Date
  expectedHarvestDate?: Date
  area: string
  areaUnit: string
  location?: string
  status: CropStatus
  waterLevel: number
  sunExposure: string
  nextTask?: string
  nextTaskDate?: Date
  notes?: string
  imageUrl?: string
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

const CropSchema = new Schema<ICrop>(
  {
    firebaseUid: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    cropType: { type: String, required: true, trim: true },
    variety: String,
    stage: {
      type: String,
      enum: [
        "preparation",
        "planting",
        "growing",
        "flowering",
        "fruiting",
        "harvesting",
      ],
      default: "preparation",
    },
    health: { type: Number, default: 100, min: 0, max: 100 },
    plantedDate: { type: Date, required: true },
    expectedHarvestDate: Date,
    area: { type: String, default: "1" },
    areaUnit: { type: String, default: "acres" },
    location: String,
    status: {
      type: String,
      enum: ["healthy", "warning", "critical"],
      default: "healthy",
    },
    waterLevel: { type: Number, default: 70, min: 0, max: 100 },
    sunExposure: { type: String, default: "Full sun" },
    nextTask: String,
    nextTaskDate: Date,
    notes: String,
    imageUrl: String,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
)

CropSchema.index({ firebaseUid: 1, isArchived: 1 })
CropSchema.index({ firebaseUid: 1, stage: 1 })

const Crop: Model<ICrop> =
  mongoose.models.Crop ?? mongoose.model<ICrop>("Crop", CropSchema)

export default Crop
