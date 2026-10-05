"use client"

import { useEffect, useState } from "react"
import { Bell, Globe, Moon, Sun, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useProfile } from "@/hooks/use-profile"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import Link from "next/link"
import { ValseaStatusCard } from "@/components/i18n/valsea-status-card"

type Prefs = {
  email: boolean
  sms: boolean
  whatsapp: boolean
  push: boolean
}

const defaultPrefs: Prefs = {
  email: true,
  sms: false,
  whatsapp: true,
  push: true,
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { profile, loading, updateProfile } = useProfile()
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const p = profile?.notificationPreferences as Prefs | undefined
    if (p) setPrefs({ ...defaultPrefs, ...p })
  }, [profile])

  const savePrefs = async () => {
    setSaving(true)
    try {
      await updateProfile({ notificationPreferences: prefs })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Notifications and preferences — profile details on{" "}
          <Link href="/dashboard/profile" className="text-primary hover:underline">
            Profile
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            WhatsApp reminders open a chat with AgriMind officer support (+94 77 211 7131).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              { key: "email" as const, label: "Email", desc: "Email reminders (coming soon)" },
              { key: "sms" as const, label: "SMS", desc: "SMS reminders (coming soon)" },
              {
                key: "whatsapp" as const,
                label: "WhatsApp",
                desc: "Task reminders via WhatsApp chat",
              },
              { key: "push" as const, label: "In-app", desc: "Bell notifications in dashboard" },
            ] as const
          ).map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={prefs[item.key]}
                onCheckedChange={(checked) =>
                  setPrefs((p) => ({ ...p, [item.key]: checked }))
                }
              />
            </div>
          ))}
          <Button onClick={savePrefs} disabled={saving}>
            {saving ? "Saving..." : "Save preferences"}
          </Button>
          <WhatsAppSupportButton className="w-full sm:w-auto" />
        </CardContent>
      </Card>

      <ValseaStatusCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language
          </CardTitle>
          <CardDescription>
            Change language from the header globe icon or on your Profile page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">Edit profile & language</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Dark mode</p>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
