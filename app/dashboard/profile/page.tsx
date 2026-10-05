"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PreferredLanguageSelect } from "@/components/i18n/preferred-language-select"
import { useProfile } from "@/hooks/use-profile"
import { SUPPORTED_CROPS } from "@/lib/constants"
import { isSupportedLanguage } from "@/lib/i18n/languages"
import type { SupportedLanguage } from "@/types"

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    district: "",
    farmSize: "",
    primaryCrops: [] as string[],
    preferredLanguage: "en" as SupportedLanguage,
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      displayName: String(profile.displayName ?? ""),
      phone: String(profile.phone ?? ""),
      district: String(profile.district ?? ""),
      farmSize: String(profile.farmSize ?? ""),
      primaryCrops: (profile.primaryCrops as string[]) ?? [],
      preferredLanguage:
        profile.preferredLanguage &&
        isSupportedLanguage(String(profile.preferredLanguage))
          ? (profile.preferredLanguage as SupportedLanguage)
          : "en",
    })
  }, [profile])

  const toggleCrop = (crop: string) => {
    setForm((f) => ({
      ...f,
      primaryCrops: f.primaryCrops.includes(crop)
        ? f.primaryCrops.filter((c) => c !== crop)
        : [...f.primaryCrops, crop],
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Update your farmer profile — saved securely to your account.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={String(profile?.photoURL ?? "")} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {form.displayName?.[0] ?? "F"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">{String(profile?.email ?? "")}</p>
            {profile?.memberSince ? (
              <p className="text-xs text-muted-foreground mt-1">
                Member since{" "}
                {new Date(String(profile.memberSince)).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Farm details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 7X XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="Anuradhapura"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Farm size</Label>
              <Input
                value={form.farmSize}
                onChange={(e) => setForm({ ...form, farmSize: e.target.value })}
                placeholder="2 acres"
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred language</Label>
              <p className="text-xs text-muted-foreground">
                Used for AI chat, voice assistant, and on-screen language
              </p>
              <PreferredLanguageSelect
                value={form.preferredLanguage}
                onChange={(preferredLanguage) =>
                  setForm({ ...form, preferredLanguage })
                }
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary crops</Label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_CROPS.slice(0, 12).map((crop) => (
                  <Button
                    key={crop}
                    type="button"
                    size="sm"
                    variant={form.primaryCrops.includes(crop) ? "default" : "outline"}
                    onClick={() => toggleCrop(crop)}
                  >
                    {crop}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
