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

export async function listReminders(
  firebaseUid: string,
  includeCompleted = false
): Promise<IReminder[]> {
  await connectDB()
  const filter: Record<string, unknown> = { firebaseUid }
  if (!includeCompleted) filter.completed = false
  return Reminder.find(filter).sort({ dueDate: 1 }).lean()
}

export async function createReminder(
  input: CreateReminderInput
): Promise<IReminder> {
  await connectDB()
  const reminder = await Reminder.create(input)

  await createNotification({
    firebaseUid: input.firebaseUid,
    type: "reminder",
    title: "Reminder scheduled",
    message: input.title,
    link: "/dashboard/reminders",
    metadata: { reminderId: String(reminder._id) },
  })

  return reminder
}

export async function updateReminder(
  firebaseUid: string,
  reminderId: string,
  updates: Partial<CreateReminderInput> & { completed?: boolean }
): Promise<IReminder | null> {
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
}

export async function deleteReminder(
  firebaseUid: string,
  reminderId: string
): Promise<boolean> {
  await connectDB()
  const result = await Reminder.deleteOne({ _id: reminderId, firebaseUid })
  return result.deletedCount > 0
}

export async function getUpcomingReminders(
  firebaseUid: string,
  limit = 5
): Promise<IReminder[]> {
  await connectDB()
  const now = new Date()
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return Reminder.find({
    firebaseUid,
    completed: false,
    dueDate: { $lte: weekAhead },
  })
    .sort({ dueDate: 1 })
    .limit(limit)
    .lean()
}
