import mongoose, { Schema, type Document, type Model, Types } from "mongoose"
import type { CropStage } from "@/types/crop"

export interface ICropLifecycleEvent extends Document {
  cropId: Types.ObjectId
  firebaseUid: string
  stage?: CropStage
  title: string
  description?: string
  eventType: "stage_change" | "task" | "note" | "diagnosis"
  completed: boolean
  scheduledFor?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CropLifecycleEventSchema = new Schema<ICropLifecycleEvent>(
  {
    cropId: { type: Schema.Types.ObjectId, ref: "Crop", required: true, index: true },
    firebaseUid: { type: String, required: true, index: true },
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
    },
    title: { type: String, required: true, trim: true },
    description: String,
    eventType: {
      type: String,
      enum: ["stage_change", "task", "note", "diagnosis"],
      default: "note",
    },
    completed: { type: Boolean, default: false },
    scheduledFor: Date,
    completedAt: Date,
  },
  { timestamps: true }
)

CropLifecycleEventSchema.index({ cropId: 1, createdAt: -1 })

const CropLifecycleEvent: Model<ICropLifecycleEvent> =
  mongoose.models.CropLifecycleEvent ??
  mongoose.model<ICropLifecycleEvent>(
    "CropLifecycleEvent",
    CropLifecycleEventSchema
  )

export default CropLifecycleEvent
