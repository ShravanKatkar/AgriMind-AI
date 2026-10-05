"use client"

import { Loader2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MarketInsight } from "@/hooks/use-market"

type MarketInsightsSectionProps = {
  insights: MarketInsight[]
  loading: boolean
  className?: string
}

function insightStyles(type: MarketInsight["type"]) {
  if (type === "warning") return "bg-destructive/10 border-destructive/20"
  if (type === "info") return "bg-muted border-border"
  return "bg-primary/10 border-primary/20"
}

export function MarketInsightsSection({
  insights,
  loading,
  className,
}: MarketInsightsSectionProps) {
  return (
    <Card
      className={`border-primary/20 bg-gradient-to-r from-primary/10 via-accent/10 to-chart-3/10 ${className ?? ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          AI Market Insights
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!loading && insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Insights will appear when OpenAI is configured.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {insights.map((rec, index) => (
              <div
                key={index}
                className={`min-w-[min(100%,280px)] shrink-0 snap-center rounded-xl border p-4 md:min-w-0 ${insightStyles(rec.type)}`}
              >
                <h4 className="mb-1.5 text-sm font-semibold text-foreground leading-snug">
                  {rec.title}
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
