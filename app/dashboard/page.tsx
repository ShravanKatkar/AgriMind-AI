"use client"

import {
  Sprout,
  AlertTriangle,
  TrendingUp,
  CloudSun,
  Bell,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard"
import {
  CropHealthChart,
  DiagnosisActivityChart,
} from "@/components/dashboard/charts/dashboard-charts"
import { DashboardPrimaryActions } from "@/components/dashboard/dashboard-primary-actions"
import { ScrollReveal } from "@/components/motion/scroll-reveal"
import { AnimatedStatValue } from "@/components/ui/animated-counter"
import { useLanguage } from "@/contexts/language-context"
import { getGreetingKey } from "@/lib/datetime/greeting"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { sessionUser } = useAuth()
  const { t } = useLanguage()
  const { data, loading } = useDashboard()
  const firstName = sessionUser?.displayName?.split(" ")[0] ?? "Farmer"

  const cropStats = (data?.cropStats as Record<string, number>) ?? {}
  const weather = (data?.weatherSummary as Record<string, string>) ?? {}
  const reminders = (data?.reminders as Record<string, unknown>[]) ?? []
  const recentCrops = (data?.recentCrops as Record<string, unknown>[]) ?? []
  const healthTrend = (data?.healthTrend as { name: string; health: number }[]) ?? []
  const diagnosisTrend = (data?.diagnosisTrend as { date: string; count: number }[]) ?? []
  const recentAlerts = (data?.recentAlerts as { message: string; time: string }[]) ?? []
  const unread = Number(data?.unreadNotifications ?? 0)

  const stats = [
    {
      title: "Active Crops",
      value: String(cropStats.total ?? 0),
      change: `${cropStats.healthy ?? 0} healthy`,
      icon: Sprout,
      color: "bg-primary",
      href: "/dashboard/crops",
    },
    {
      title: "Active Alerts",
      value: String(unread),
      change: `${cropStats.warning ?? 0} crops need attention`,
      icon: AlertTriangle,
      color: "bg-accent",
      href:
        Number(cropStats.warning ?? 0) > 0
          ? "/dashboard/crops"
          : "/dashboard/reminders",
    },
    {
      title: "AI Diagnoses",
      value: String(data?.diagnosisCount ?? 0),
      change: "Total reports",
      icon: TrendingUp,
      color: "bg-agri-teal",
      href: "/dashboard/diagnosis/history",
    },
    {
      title: "Weather",
      value: weather.temp ?? "—",
      change: weather.condition ?? "—",
      icon: CloudSun,
      color: "bg-agri-teal-light",
      href: "/dashboard/weather",
    },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ScrollReveal className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            {t(getGreetingKey())}, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("dashboard.welcomeSubtitle")}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <DashboardPrimaryActions />
      </ScrollReveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <ScrollReveal key={stat.title} delay={index * 0.08}>
            <Link
              href={stat.href}
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`${stat.title}: ${stat.value}. ${stat.change}`}
            >
              <Card className="transition-all duration-200 group-hover:border-primary/25 group-hover:shadow-md">
                <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="mt-1 text-2xl font-bold">
                      <AnimatedStatValue display={stat.value} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105 ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                </CardContent>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.12}>
          <Link
            href="/dashboard/crops"
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Crop Health chart — view all crops"
          >
            <Card className="overflow-hidden transition-all duration-200 group-hover:border-primary/25 group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-2 w-2 rounded-full bg-agri-teal" aria-hidden />
                  Crop Health
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CropHealthChart data={healthTrend} />
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>
        <ScrollReveal delay={0.18}>
          <Link
            href="/dashboard/diagnosis/history"
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Diagnosis Activity chart — view diagnosis history"
          >
            <Card className="overflow-hidden transition-all duration-200 group-hover:border-primary/25 group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="h-2 w-2 rounded-full bg-agri-teal-light" aria-hidden />
                  Diagnosis Activity
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DiagnosisActivityChart data={diagnosisTrend} />
              </CardContent>
            </Card>
          </Link>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Crops</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/crops">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentCrops.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">No crops yet</p>
                  <Button asChild>
                    <Link href="/dashboard/crops/new">
                      <Plus className="mr-2 h-4 w-4" /> Add First Crop
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCrops.map((crop) => (
                    <Link
                      key={String(crop._id)}
                      href={`/dashboard/crops/${crop._id}`}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium">{String(crop.name)}</p>
                        <p className="text-sm capitalize text-muted-foreground">
                          {String(crop.cropType)} · {String(crop.stage)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {Number(crop.health)}%
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                {reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                ) : (
                  reminders.map((r) => (
                    <div key={String(r._id)} className="rounded-lg bg-muted/50 p-2">
                      <p className="text-sm font-medium">{String(r.title)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(String(r.dueDate)).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/reminders">Manage Reminders</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No alerts yet</p>
                ) : (
                  recentAlerts.map((a, i) => (
                    <div key={i} className="flex gap-2 rounded-lg bg-muted/50 p-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm">{a.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
