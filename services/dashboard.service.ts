import { connectDB } from "@/lib/mongodb"
import Crop from "@/models/Crop"
import DiagnosisReport from "@/models/DiagnosisReport"
import { getCropStats } from "@/services/crop.service"
import { getUnreadCount } from "@/services/notification.service"
import { getUpcomingReminders } from "@/services/reminder.service"
import { fetchWeather } from "@/services/weather.service"
import { getUserByFirebaseUid } from "@/services/user.service"

export async function getCropHealthTrend(firebaseUid: string) {
  await connectDB()
  const crops = await Crop.find({ firebaseUid, isArchived: false })
    .select("name health cropType status updatedAt")
    .lean()
  return crops.map((c) => ({
    name: c.name.length > 12 ? `${c.name.slice(0, 12)}…` : c.name,
    health: c.health,
    cropType: c.cropType,
    status: c.status,
  }))
}

export async function getDiagnosisTrend(firebaseUid: string) {
  await connectDB()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const reports = await DiagnosisReport.find({
    firebaseUid,
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ createdAt: 1 })
    .lean()

  const byWeek: Record<string, number> = {}
  for (const r of reports) {
    const week = new Date(r.createdAt).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    })
    byWeek[week] = (byWeek[week] ?? 0) + 1
  }

  return Object.entries(byWeek).map(([date, count]) => ({ date, count }))
}

export async function getDashboardStats(firebaseUid: string) {
  await connectDB()

  const [cropStats, reminders, unreadNotifications, user, healthTrend, diagnosisTrend] =
    await Promise.all([
      getCropStats(firebaseUid),
      getUpcomingReminders(firebaseUid, 5),
      getUnreadCount(firebaseUid),
      getUserByFirebaseUid(firebaseUid),
      getCropHealthTrend(firebaseUid),
      getDiagnosisTrend(firebaseUid),
    ])

  const district = user?.district?.toLowerCase() ?? ""
  let locationId = "colombo"
  if (district.includes("kandy")) locationId = "kandy"
  else if (district.includes("jaffna")) locationId = "jaffna"
  else if (district.includes("galle")) locationId = "galle"
  else if (district.includes("anuradhapura")) locationId = "anuradhapura"

  let weatherSummary = { temp: "—", condition: "—", locationId }
  try {
    const weather = await fetchWeather(locationId)
    weatherSummary = {
      temp: `${weather.current.temperature}°C`,
      condition: weather.current.condition,
      locationId,
    }
  } catch {
    weatherSummary = { temp: "28°C", condition: "Partly cloudy", locationId }
  }

  const recentCrops = await Crop.find({ firebaseUid, isArchived: false })
    .sort({ updatedAt: -1 })
    .limit(4)
    .lean()

  const diagnosisCount = await DiagnosisReport.countDocuments({ firebaseUid })
  const recentAlerts = await DiagnosisReport.find({ firebaseUid })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean()

  return {
    cropStats,
    reminders,
    unreadNotifications,
    weatherSummary,
    diagnosisCount,
    recentCrops,
    healthTrend,
    diagnosisTrend,
    recentAlerts: recentAlerts.map((d) => ({
      id: String(d._id),
      message: `${d.disease} on ${d.cropType}`,
      severity: d.severity,
      time: d.createdAt,
    })),
  }
}
