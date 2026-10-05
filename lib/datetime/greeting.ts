import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"

/** Greeting catalog key from local hour (Asia/Colombo when used with live clock). */
export function getGreetingKey(date = new Date()): UiCatalogKey {
  const hour = Number(
    date.toLocaleString("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    })
  )

  if (hour >= 5 && hour < 12) return "dashboard.greetingMorning"
  if (hour >= 12 && hour < 17) return "dashboard.greetingAfternoon"
  return "dashboard.greetingEvening"
}

export function formatColomboDateTime(date: Date) {
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })

  const dateLabel = date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })

  const shortDate = date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })

  return { time, dateLabel, shortDate }
}
