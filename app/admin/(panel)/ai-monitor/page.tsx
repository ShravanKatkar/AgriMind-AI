"use client"

import { useEffect, useState } from "react"
import { Brain, Loader2, AlertTriangle, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface AiMonitorData {
  sessionsToday: number
  totalVoiceMessages: number
  highSeverityCount: number
  activePriceAlerts: number
  recentConversations: {
    id: string
    title: string
    language: string
    messageCount: number
    updatedAt: string
    farmerName: string
  }[]
  recentDiagnoses: {
    cropType: string
    disease: string
    severity: string
    confidence: number
    createdAt: string
    farmerName: string
  }[]
}

export default function AdminAiMonitorPage() {
  const [data, setData] = useState<AiMonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/ai-monitor")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const metrics = [
    {
      label: "Voice sessions today",
      value: data?.sessionsToday ?? 0,
      icon: Brain,
      color: "bg-primary text-primary-foreground",
    },
    {
      label: "Total voice messages",
      value: data?.totalVoiceMessages ?? 0,
      icon: MessageSquare,
      color: "bg-agri-teal text-white",
    },
    {
      label: "High severity diagnoses",
      value: data?.highSeverityCount ?? 0,
      icon: AlertTriangle,
      color: "bg-destructive text-destructive-foreground",
    },
    {
      label: "Active price alerts",
      value: data?.activePriceAlerts ?? 0,
      icon: AlertTriangle,
      color: "bg-accent text-accent-foreground",
    },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI Monitor"
        description="Voice assistant usage and diagnosis oversight across the platform."
        icon={Brain}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card
            key={m.label}
            className="transition-all duration-200 hover:border-primary/25 hover:shadow-md"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  m.color
                )}
              >
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent voice conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentConversations ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            ) : (
              data?.recentConversations.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">{c.title}</p>
                    <span className="text-xs text-muted-foreground uppercase">{c.language}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {c.farmerName} · {c.messageCount} messages ·{" "}
                    {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentDiagnoses ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No diagnoses yet</p>
            ) : (
              data?.recentDiagnoses.map((d, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">
                      {d.cropType} — {d.disease}
                    </p>
                    <span
                      className={`text-xs capitalize ${
                        d.severity === "high" ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.farmerName} · {Math.round(d.confidence)}% ·{" "}
                    {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
