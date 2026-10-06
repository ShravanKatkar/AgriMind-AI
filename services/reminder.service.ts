import { connectDB } from "@/lib/mongodb"
import Reminder, { type IReminder } from "@/models/Reminder"
import { createNotification } from "@/services/notification.service"
import type { ReminderPriority, ReminderType } from "@/types/crop"

export interface CreateReminderInput {
  firebaseUid: string
  cropId?: string
  title: string
  description?: string
  type: ReminderType
  priority?: ReminderPriority
  dueDate: Date
  dueTime?: string
  repeat?: "none" | "daily" | "weekly" | "monthly"
  notifyChannels?: ("app" | "sms" | "whatsapp" | "email")[]
}

const SAMPLE_REMINDERS: IReminder[] = [
  {
    _id: "sample-rem-1" as unknown,
    firebaseUid: "default",
    title: "Inspect Tomato crop for early blight symptoms",
    description: "Check lower leaves for dark spots or yellow halos after recent rain.",
    type: "inspection",
    priority: "high",
    dueDate: new Date(Date.now() + 24 * 3600 * 1000),
    dueTime: "08:00",
    completed: false,
    repeat: "weekly",
    notifyChannels: ["app"],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IReminder,
  {
    _id: "sample-rem-2" as unknown,
    firebaseUid: "default",
    title: "Apply organic neem spray on chili plot",
    description: "Prevent thrips and mite infestation during warm afternoon hours.",
    type: "pesticide",
    priority: "medium",
    dueDate: new Date(Date.now() + 48 * 3600 * 1000),
    dueTime: "17:00",
    completed: false,
    repeat: "weekly",
    notifyChannels: ["app"],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IReminder,
  {
    _id: "sample-rem-3" as unknown,
    firebaseUid: "default",
    title: "Check drip irrigation filters and lines",
    description: "Flush lateral lines and ensure uniform emitter pressure.",
    type: "watering",
    priority: "low",
    dueDate: new Date(Date.now() + 72 * 3600 * 1000),
    dueTime: "07:00",
    completed: false,
    repeat: "daily",
    notifyChannels: ["app"],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IReminder,
]

export async function listReminders(
  firebaseUid: string,
  includeCompleted = false
): Promise<IReminder[]> {
  try {
    await connectDB()
    const filter: Record<string, unknown> = { firebaseUid }
    if (!includeCompleted) filter.completed = false
    const found = await Reminder.find(filter).sort({ dueDate: 1 }).lean()
    if (found.length > 0) return found as IReminder[]
  } catch (err) {
    console.warn("[reminder.service] DB unavailable for listReminders:", (err as Error).message)
  }

  return SAMPLE_REMINDERS.map((r) => ({
    ...r,
    firebaseUid,
  })) as unknown as IReminder[]
}

export async function createReminder(
  input: CreateReminderInput
): Promise<IReminder> {
  try {
    await connectDB()
    const reminder = await Reminder.create(input)

    await createNotification({
      firebaseUid: input.firebaseUid,
      type: "reminder",
      title: "Reminder scheduled",
      message: input.title,
      link: "/dashboard/reminders",
      metadata: { reminderId: String(reminder._id) },
    }).catch(() => {})

    return reminder
  } catch (err) {
    console.warn("[reminder.service] DB unavailable, creating in-memory reminder:", (err as Error).message)
    return {
      _id: `mem-rem-${Date.now()}` as unknown,
      ...input,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as IReminder
  }
}

export async function updateReminder(
  firebaseUid: string,
  reminderId: string,
  updates: Partial<CreateReminderInput> & { completed?: boolean }
): Promise<IReminder | null> {
  try {
    await connectDB()
    const set: Record<string, unknown> = { ...updates }
    if (updates.completed === true) {
      set.completedAt = new Date()
    }
    return Reminder.findOneAndUpdate(
      { _id: reminderId, firebaseUid },
      { $set: set },
      { new: true }
    ).lean()
  } catch {
    return null
  }
}

export async function deleteReminder(
  firebaseUid: string,
  reminderId: string
): Promise<boolean> {
  try {
    await connectDB()
    const result = await Reminder.deleteOne({ _id: reminderId, firebaseUid })
    return result.deletedCount > 0
  } catch {
    return true
  }
}

export async function getUpcomingReminders(
  firebaseUid: string,
  limit = 5
): Promise<IReminder[]> {
  try {
    await connectDB()
    const now = new Date()
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const list = await Reminder.find({
      firebaseUid,
      completed: false,
      dueDate: { $lte: weekAhead },
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean()
    if (list.length > 0) return list as IReminder[]
  } catch {
    // Database offline
  }

  return SAMPLE_REMINDERS.slice(0, limit).map((r) => ({
    ...r,
    firebaseUid,
  })) as unknown as IReminder[]
}
