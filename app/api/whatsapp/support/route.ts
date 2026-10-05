import { NextResponse } from "next/server"
import { buildSupportChatUrl } from "@/services/whatsapp.service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const message = searchParams.get("message") ?? undefined
  return NextResponse.json({
    success: true,
    data: { url: buildSupportChatUrl(message ?? undefined) },
  })
}
