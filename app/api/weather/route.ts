import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { fetchWeather } from "@/services/weather.service"
import { createNotification } from "@/services/notification.service"

export async function GET(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get("location") ?? "pune"

    const weather = await fetchWeather(locationId)

    if (weather.alerts.length > 0) {
      const alert = weather.alerts[0]
      await createNotification({
        firebaseUid: session.uid,
        type: "weather",
        title: "Weather alert",
        message: alert.message,
        link: "/dashboard/weather",
      }).catch(() => {})
    }

    return NextResponse.json(
      { success: true, data: weather },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    console.error("[weather GET]", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch weather" },
      { status: 500 }
    )
  }
}
