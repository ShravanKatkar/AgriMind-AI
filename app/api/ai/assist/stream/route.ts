import { getSessionUser } from "@/lib/auth/session"
import { streamFarmingAssistantReply } from "@/services/ai.service"
import type { ChatMessageInput } from "@/types/ai"
import type { SupportedLanguage } from "@/types"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const { message, language, history } = body as {
      message?: string
      language?: SupportedLanguage
      history?: ChatMessageInput[]
    }

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lang: SupportedLanguage = language ?? "en"
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamFarmingAssistantReply(
            message.trim(),
            lang,
            history ?? []
          )) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            )
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Stream failed"
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[ai/assist/stream]", error)
    return new Response(JSON.stringify({ error: "Stream failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
