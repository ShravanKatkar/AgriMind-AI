import { connectDB } from "@/lib/mongodb"
import Reminder from "@/models/Reminder"
import { createNotification } from "@/services/notification.service"
const DUE_WINDOW_MS = 24 * 60 * 60 * 1000 // notify for due within 24h or overdue

export async function processDueReminders(firebaseUid: string): Promise<number> {
  await connectDB()
  const now = new Date()
  const windowEnd = new Date(now.getTime() + DUE_WINDOW_MS)

  const due = await Reminder.find({
    firebaseUid,
    completed: false,
    dueDate: { $lte: windowEnd },
    $or: [
      { lastNotifiedAt: { $exists: false } },
      { lastNotifiedAt: null },
      {
        lastNotifiedAt: {
          $lt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        },
      },
    ],
  }).lean()

  let count = 0
  for (const r of due) {
    const isOverdue = new Date(r.dueDate) < now
    await createNotification({
      firebaseUid,
      type: "reminder",
      title: isOverdue ? "Overdue reminder" : "Upcoming task",
      message: `${r.title} — due ${new Date(r.dueDate).toLocaleString()}`,
      link: "/dashboard/reminders",
      metadata: {
        reminderId: String(r._id),
        notifyChannels: r.notifyChannels ?? ["app"],
      },
    })

    await Reminder.updateOne(
      { _id: r._id },
      { $set: { lastNotifiedAt: now } }
    )
    count++
  }

  return count
}
