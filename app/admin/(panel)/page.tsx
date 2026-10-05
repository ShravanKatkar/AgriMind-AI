"use client"

import Link from "next/link"
import { Users, Sprout, Brain, Bell, Loader2, TrendingUp, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminStats } from "@/hooks/use-admin-stats"
import {
  SignupTrendChart,
  PlatformActivityChart,
  SeverityPieChart,
  DistrictBarChart,
} from "@/components/admin/admin-charts"
import { AnimatedStatValue } from "@/components/ui/animated-counter"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { cn } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { data, loading, error } = useAdminStats()
  const stats = data?.stats

  const cards = stats
    ? [
        {
          title: "Total Farmers",
          value: String(stats.totalFarmers),
          sub: `+${stats.farmersThisWeek} this week`,
          icon: Users,
          color: "bg-primary text-primary-foreground",
          href: "/admin/farmers",
        },
        {
          title: "Crop Reports",
          value: String(stats.totalDiagnoses),
          sub: `${stats.totalCrops} active crops tracked`,
          icon: Sprout,
          color: "bg-agri-teal text-white",
          href: "/admin/reports",
        },
        {
          title: "AI Sessions Today",
          value: String(stats.aiSessionsToday),
          sub: "Voice assistant conversations",
          icon: Brain,
          color: "bg-accent text-accent-foreground",
          href: "/admin/ai-monitor",
        },
        {
          title: "Unread Alerts",
          value: String(stats.activeAlerts),
          sub: `${stats.totalOfficers} officers on platform`,
          icon: Bell,
          color: "bg-chart-3 text-white",
          href: "/admin/notifications",
        },
      ]
    : []

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        Loading analytics…
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Overview"
        description="Platform analytics, farmer activity, and AI monitoring across AgriMind AI."
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat, i) => (
          <ScrollReveal key={stat.title} delay={i * 0.08}>
            <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
              <CardContent className="p-5">
                <Link href={stat.href} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      <AnimatedStatValue display={stat.value} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      stat.color
                    )}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScrollReveal>
          <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Farmer Signups (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SignupTrendChart data={data?.signups ?? []} />
            </CardContent>
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Platform Activity (14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformActivityChart data={data?.activity ?? []} />
            </CardContent>
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Diagnosis Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <SeverityPieChart data={data?.severity ?? []} />
            </CardContent>
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={0.14}>
          <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Farmers by District</CardTitle>
            </CardHeader>
            <CardContent>
              <DistrictBarChart data={data?.districts ?? []} />
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.18}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold text-foreground">Full analytics</p>
              <p className="text-sm text-muted-foreground">
                Deep dives into trends, districts, and AI usage.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/analytics">Open analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  )
}
