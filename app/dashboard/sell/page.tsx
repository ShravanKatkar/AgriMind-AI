"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Sparkles, LineChart, ArrowRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export default function SellProductsPage() {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            {t("sell.comingSoon")}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("sell.title")}
        </h1>
        <p className="text-muted-foreground">{t("sell.subtitle")}</p>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary/10 via-background to-agri-teal/5 px-6 py-10 text-center sm:px-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-base leading-relaxed text-foreground sm:text-lg">
              {t("sell.message")}
            </p>
            <p className="mt-4 text-sm font-medium text-primary">
              {t("sell.updateNote")}
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {t("sell.useMarket")}
            </p>
            <Button className="mt-8 gap-2" asChild>
              <Link href="/dashboard/market">
                <LineChart className="h-4 w-4" />
                {t("sell.viewMarket")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
