import { getOpenAIClient, openaiConfig } from "@/lib/openai/client"
import { deepStripAsterisks } from "@/lib/chat/clean-text"
import type { WeatherData } from "@/services/weather.service"

export interface WeatherAnalysis {
  summary: string
  risks: string[]
  recommendations: string[]
}

export async function generateWeatherFarmingAnalysis(
  weather: WeatherData
): Promise<WeatherAnalysis | null> {
  if (!openaiConfig.apiKey) return null

  const forecastSummary = weather.forecast
    .slice(0, 7)
    .map(
      (d) =>
        `${d.dayName}: ${d.condition}, ${d.high}°/${d.low}°C, rain ${d.rainChance}%`
    )
    .join("\n")

  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: openaiConfig.chatModel,
    temperature: 0.6,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are AgriMind AI — Indian farming weather advisor.
Use the live weather data provided. Return JSON:
{
  "summary": "2-3 sentences for farmers",
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["action 1", "action 2", "action 3"]
}
Focus on regional crops (rice, wheat, soybean, cotton, vegetables, pulses, sugarcane, onion). Mention Kharif/Rabi/Zaid seasons when relevant.
CRITICAL FORMATTING RULE: Do NOT use asterisks (*) or (**) anywhere in any text.`,
      },
      {
        role: "user",
        content: `Location: ${weather.location.name}
Current: ${weather.current.temperature}°C, ${weather.current.condition}, humidity ${weather.current.humidity}%, wind ${weather.current.windSpeed} km/h, UV ${weather.current.uvIndex ?? "n/a"}, rain chance now ${weather.current.precipitationChance ?? 0}%
7-day forecast:
${forecastSummary}
Existing alerts: ${weather.alerts.map((a) => a.message).join("; ") || "none"}`,
      },
    ],
  })

  const raw = completion.choices[0]?.message?.content
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as WeatherAnalysis
    return deepStripAsterisks({
      summary: parsed.summary ?? "",
      risks: (parsed.risks ?? []).slice(0, 4),
      recommendations: (parsed.recommendations ?? []).slice(0, 5),
    })
  } catch {
    return null
  }
}
