import { connectDB } from "@/lib/mongodb"
import User, { type IUser } from "@/models/User"
import Crop from "@/models/Crop"
import DiagnosisReport from "@/models/DiagnosisReport"
import Notification from "@/models/Notification"
import VoiceConversation from "@/models/VoiceConversation"
import MarketAlert from "@/models/MarketAlert"
import type { UserRole } from "@/types"

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export interface AdminOverviewStats {
  totalFarmers: number
  totalDiagnoses: number
  aiSessionsToday: number
  activeAlerts: number
  totalCrops: number
  totalOfficers: number
  farmersThisWeek: number
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  await connectDB()
  const today = startOfToday()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalFarmers,
    totalDiagnoses,
    aiSessionsToday,
    activeAlerts,
    totalCrops,
    totalOfficers,
    farmersThisWeek,
  ] = await Promise.all([
    User.countDocuments({ role: "farmer", isActive: true }),
    DiagnosisReport.countDocuments(),
    VoiceConversation.countDocuments({ updatedAt: { $gte: today } }),
    Notification.countDocuments({ read: false }),
    Crop.countDocuments({ isArchived: false }),
    User.countDocuments({ role: { $in: ["officer", "admin"] }, isActive: true }),
    User.countDocuments({ role: "farmer", createdAt: { $gte: weekAgo } }),
  ])

  return {
    totalFarmers,
    totalDiagnoses,
    aiSessionsToday,
    activeAlerts,
    totalCrops,
    totalOfficers,
    farmersThisWeek,
  }
}

export async function getSignupTrend(days = 30) {
  await connectDB()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const users = await User.find({ role: "farmer", createdAt: { $gte: since } })
    .select("createdAt")
    .lean()

  const byDay: Record<string, number> = {}
  for (const u of users) {
    const key = new Date(u.createdAt).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })
    byDay[key] = (byDay[key] ?? 0) + 1
  }

  return Object.entries(byDay).map(([date, signups]) => ({ date, signups }))
}

export async function getPlatformActivityTrend(days = 14) {
  await connectDB()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [diagnoses, voiceSessions] = await Promise.all([
    DiagnosisReport.find({ createdAt: { $gte: since } }).select("createdAt").lean(),
    VoiceConversation.find({ updatedAt: { $gte: since } }).select("updatedAt").lean(),
  ])

  const byDay: Record<string, { diagnoses: number; voice: number }> = {}

  for (const d of diagnoses) {
    const key = new Date(d.createdAt).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })
    if (!byDay[key]) byDay[key] = { diagnoses: 0, voice: 0 }
    byDay[key].diagnoses++
  }

  for (const v of voiceSessions) {
    const key = new Date(v.updatedAt).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })
    if (!byDay[key]) byDay[key] = { diagnoses: 0, voice: 0 }
    byDay[key].voice++
  }

  return Object.entries(byDay).map(([date, counts]) => ({
    date,
    diagnoses: counts.diagnoses,
    voice: counts.voice,
  }))
}

export async function getDiagnosisSeverityBreakdown() {
  await connectDB()
  const results = await DiagnosisReport.aggregate([
    { $group: { _id: "$severity", count: { $sum: 1 } } },
  ])
  return results.map((r) => ({
    severity: r._id as string,
    count: r.count as number,
  }))
}

export async function getDistrictDistribution() {
  await connectDB()
  const results = await User.aggregate([
    { $match: { role: "farmer", district: { $exists: true, $ne: "" } } },
    { $group: { _id: "$district", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ])
  return results.map((r) => ({ district: r._id as string, farmers: r.count as number }))
}

export async function listFarmers(options: {
  page?: number
  limit?: number
  search?: string
}) {
  await connectDB()
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, options.limit ?? 20)
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = { role: "farmer" }
  if (options.search?.trim()) {
    const q = options.search.trim()
    filter.$or = [
      { displayName: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { district: new RegExp(q, "i") },
    ]
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ])

  return { items, total, page, pages: Math.ceil(total / limit) }
}

export async function updateFarmerByAdmin(
  firebaseUid: string,
  updates: { isActive?: boolean; role?: UserRole }
): Promise<IUser | null> {
  await connectDB()
  if (updates.role && !["farmer", "officer", "admin"].includes(updates.role)) {
    throw new Error("Invalid role")
  }
  return User.findOneAndUpdate(
    { firebaseUid },
    { $set: updates },
    { new: true, runValidators: true }
  )
}

export async function listDiagnosisReports(options: {
  page?: number
  limit?: number
  severity?: string
}) {
  await connectDB()
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, options.limit ?? 20)
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = {}
  if (options.severity) filter.severity = options.severity

  const [reports, total] = await Promise.all([
    DiagnosisReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DiagnosisReport.countDocuments(filter),
  ])

  const uids = [...new Set(reports.map((r) => r.firebaseUid))]
  const users = await User.find({ firebaseUid: { $in: uids } })
    .select("firebaseUid displayName email district")
    .lean()
  const userMap = new Map(users.map((u) => [u.firebaseUid, u]))

  const items = reports.map((r) => ({
    ...r,
    farmer: userMap.get(r.firebaseUid) ?? null,
  }))

  return { items, total, page, pages: Math.ceil(total / limit) }
}

export async function listOfficers() {
  await connectDB()
  return User.find({ role: { $in: ["officer", "admin"] } })
    .sort({ role: 1, displayName: 1 })
    .lean()
}

export async function listPlatformNotifications(limit = 40) {
  await connectDB()
  const [items, unreadTotal, byType] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ read: false }),
    Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
  ])

  return { items, unreadTotal, byType }
}

export async function getAiMonitorData() {
  await connectDB()
  const today = startOfToday()

  const [
    recentConversations,
    recentDiagnoses,
    highSeverityCount,
    sessionsToday,
    totalMessages,
  ] = await Promise.all([
    VoiceConversation.find()
      .sort({ updatedAt: -1 })
      .limit(15)
      .lean(),
    DiagnosisReport.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("cropType disease severity confidence createdAt firebaseUid")
      .lean(),
    DiagnosisReport.countDocuments({ severity: "high" }),
    VoiceConversation.countDocuments({ updatedAt: { $gte: today } }),
    VoiceConversation.aggregate([
      { $project: { messageCount: { $size: "$messages" } } },
      { $group: { _id: null, total: { $sum: "$messageCount" } } },
    ]),
  ])

  const uids = [
    ...new Set([
      ...recentConversations.map((c) => c.firebaseUid),
      ...recentDiagnoses.map((d) => d.firebaseUid),
    ]),
  ]
  const users = await User.find({ firebaseUid: { $in: uids } })
    .select("firebaseUid displayName")
    .lean()
  const userMap = new Map(users.map((u) => [u.firebaseUid, u.displayName]))

  return {
    recentConversations: recentConversations.map((c) => ({
      id: String(c._id),
      title: c.title,
      language: c.language,
      messageCount: c.messages?.length ?? 0,
      updatedAt: c.updatedAt,
      farmerName: userMap.get(c.firebaseUid) ?? "Unknown",
    })),
    recentDiagnoses: recentDiagnoses.map((d) => ({
      ...d,
      farmerName: userMap.get(d.firebaseUid) ?? "Unknown",
    })),
    highSeverityCount,
    sessionsToday,
    totalVoiceMessages: totalMessages[0]?.total ?? 0,
    activePriceAlerts: await MarketAlert.countDocuments({ active: true }),
  }
}
