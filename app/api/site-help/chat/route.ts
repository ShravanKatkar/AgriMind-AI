import { NextResponse } from "next/server"

import { generateSiteHelpReply } from "@/services/site-help.service"
import type { ChatMessageInput } from "@/types/ai"

/** Public website help chat — explains pages and how to use AgriMind (OpenAI) */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, pathname, pageSnapshot, history } = body as {
      message?: string
      pathname?: string
      pageSnapshot?: string
      history?: ChatMessageInput[]
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const reply = await generateSiteHelpReply({
      message: message.trim(),
      pathname: pathname ?? "/",
      pageSnapshot: pageSnapshot?.trim() || undefined,
      history: history ?? [],
    })

    return NextResponse.json({ success: true, data: { reply } })
  } catch (error) {
    console.error("[site-help/chat]", error)
    const msg =
      error instanceof Error ? error.message : "Site help request failed"
    const status = msg.includes("OPENAI_API_KEY") ? 503 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
