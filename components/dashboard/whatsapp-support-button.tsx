"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildSupportChatUrl } from "@/services/whatsapp.service"
import { cn } from "@/lib/utils"

interface WhatsAppSupportButtonProps {
  message?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  label?: string
}

export function WhatsAppSupportButton({
  message,
  variant = "outline",
  size = "sm",
  className,
  label = "WhatsApp Support",
}: WhatsAppSupportButtonProps) {
  const href = buildSupportChatUrl(message)

  return (
    <Button variant={variant} size={size} className={cn("gap-2", className)} asChild>
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4 text-[#25D366]" />
        {label}
      </Link>
    </Button>
  )
}
