import type { IMarketCrop } from "@/models/MarketCrop"

export interface MarketLocationView {
  name: string
  demand: "Very High" | "High" | "Medium" | "Low"
  crops: string[]
}

const HUB_ORDER = ["Pune", "Nashik", "Mumbai", "Nagpur", "Delhi"] as const

/** Map crop district → major wholesale hub */
function resolveHub(location: string, market?: string): string {
  const text = `${location} ${market ?? ""}`.toLowerCase()
  if (text.includes("nashik") || text.includes("lasalgaon") || text.includes("pimpalgaon") || text.includes("dindori")) return "Nashik"
  if (text.includes("mumbai") || text.includes("vashi") || text.includes("thane") || text.includes("konkan")) return "Mumbai"
  if (text.includes("nagpur") || text.includes("amravati") || text.includes("wardha") || text.includes("vidarbha")) return "Nagpur"
  if (text.includes("delhi") || text.includes("azadpur") || text.includes("punjab") || text.includes("haryana") || text.includes("lucknow")) return "Delhi"
  return "Pune"
}

function demandScore(crop: IMarketCrop): number {
  const base =
    crop.demandLevel === "high" ? 3 : crop.demandLevel === "medium" ? 2 : 1
  const trend = crop.trend === "up" ? 1 : crop.trend === "down" ? -0.5 : 0
  return base + trend
}

function toDemandLabel(avg: number): MarketLocationView["demand"] {
  if (avg >= 2.8) return "Very High"
  if (avg >= 2.2) return "High"
  if (avg >= 1.6) return "Medium"
  return "Low"
}

/** Build hub demand from current crop prices (updates when AI refresh runs). */
export function deriveMarketLocationsFromCrops(
  crops: IMarketCrop[]
): MarketLocationView[] {
  const hubMap = new Map<
    string,
    { score: number; count: number; crops: { name: string; score: number }[] }
  >()

  for (const hub of HUB_ORDER) {
    hubMap.set(hub, { score: 0, count: 0, crops: [] })
  }

  for (const crop of crops) {
    const hub = resolveHub(crop.location, crop.market)
    const entry = hubMap.get(hub) ?? hubMap.get("Pune")!
    const s = demandScore(crop)
    entry.score += s
    entry.count += 1
    entry.crops.push({
      name: crop.name,
      score: s + Math.max(0, crop.changePercent / 10),
    })
  }

  return HUB_ORDER.map((name) => {
    const entry = hubMap.get(name)!
    const avg = entry.count > 0 ? entry.score / entry.count : 1.5
    const popular = [...entry.crops]
      .sort((a, b) => b.score - a.score)
      .map((c) => c.name)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .slice(0, 4)

    return {
      name,
      demand: toDemandLabel(avg),
      crops:
        popular.length > 0
          ? popular
          : crops.slice(0, 3).map((c) => c.name),
    }
  })
}
