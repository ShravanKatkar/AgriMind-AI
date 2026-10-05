"use client"

import { Loader2, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { useAdminStats } from "@/hooks/use-admin-stats"
import {
  SignupTrendChart,
  PlatformActivityChart,
  SeverityPieChart,
  DistrictBarChart,
} from "@/components/admin/admin-charts"

export default function AdminAnalyticsPage() {
  const { data, loading, error } = useAdminStats()

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  const chartCards = [
    { title: "Farmer growth", chart: <SignupTrendChart data={data?.signups ?? []} /> },
    {
      title: "AI & diagnosis activity",
      chart: <PlatformActivityChart data={data?.activity ?? []} />,
    },
    {
      title: "Severity distribution",
      chart: <SeverityPieChart data={data?.severity ?? []} />,
    },
    {
      title: "Geographic spread",
      chart: <DistrictBarChart data={data?.districts ?? []} />,
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Deep platform metrics and trends across South Asia."
        icon={BarChart3}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {chartCards.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.06}>
            <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>{item.chart}</CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
