"use client"

import { MapPin, TrendingDown, TrendingUp } from "lucide-react"
import type { MarketCropPrice } from "@/hooks/use-market"

type MarketPriceCardsProps = {
  crops: MarketCropPrice[]
}

export function MarketPriceCards({ crops }: MarketPriceCardsProps) {
  if (crops.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No crops match your search.
      </p>
    )
  }

  return (
    <div className="space-y-3 md:hidden">
      {crops.map((crop) => (
        <article
          key={crop.name}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground">{crop.name}</h3>
              {crop.nameSi ? (
                <p className="text-xs text-muted-foreground">{crop.nameSi}</p>
              ) : null}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                crop.demandLevel === "high"
                  ? "bg-primary/10 text-primary"
                  : crop.demandLevel === "medium"
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {crop.demandLevel}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-foreground">Rs. {crop.price}</p>
              <p className="text-xs text-muted-foreground">per {crop.unit}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                crop.trend === "up"
                  ? "text-primary"
                  : crop.trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {crop.trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : crop.trend === "down" ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              {crop.changePercent > 0 ? "+" : ""}
              {crop.changePercent}%
            </div>
          </div>

          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {crop.location}
          </p>
        </article>
      ))}
    </div>
  )
}
