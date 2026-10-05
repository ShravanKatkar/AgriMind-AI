import { VALSEA_MODELS } from "./constants"
import { getValseaBaseUrl, requireValseaApiKey } from "./config"

const BASE_URL = getValseaBaseUrl()

function getApiKey(): string {
  return requireValseaApiKey()
}

function parseTranslateError(data: unknown, status: number): string {
  const payload = data as {
    error?: { message?: string } | string
    message?: string
  }
  if (typeof payload.error === "string") return payload.error
  if (payload.error && typeof payload.error === "object" && payload.error.message) {
    return payload.error.message
  }
  if (payload.message) return payload.message
  if (status === 401) {
    return "Invalid VALSEA_API_KEY. Check your key at valsea.ai/dashboard."
  }
  if (status === 402) {
    return "VALSEA account has insufficient credits. Top up at valsea.ai/dashboard."
  }
  if (status === 400) {
    return "This language is not supported by Valsea translate. The app will use OpenAI instead."
  }
  return `Translation failed (${status})`
}

function authHeaders(contentType?: string): HeadersInit {
  const key = getApiKey()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "X-API-Key": key,
  }
  if (contentType) {
    headers["Content-Type"] = contentType
  }
  return headers
}

export interface TranscribeOptions {
  file: Blob
  filename?: string
  /** Omit or `"auto"` to let VALSEA detect language */
  language?: string
  enableCorrection?: boolean
  enableTags?: boolean
}

export interface TranscribeResult {
  text: string
  clarifiedText?: string
  rawTranscript?: string
}

function parseTranscribeError(data: unknown, status: number): string {
  const payload = data as {
    error?: { message?: string } | string
    message?: string
  }
  if (typeof payload.error === "string") return payload.error
  if (payload.error && typeof payload.error === "object" && payload.error.message) {
    return payload.error.message
  }
  if (payload.message) return payload.message
  if (status === 401) {
    return "Voice service is not configured. Add a valid VALSEA_API_KEY."
  }
  return `Transcription failed (${status})`
}

function languageAttempts(language?: string): (string | undefined)[] {
  const lang = language?.trim().toLowerCase()
  if (!lang || lang === "auto") {
    return [undefined, "english", "hindi", "marathi"]
  }
  return [lang]
}

async function transcribeOnce(
  options: TranscribeOptions,
  language: string | undefined,
  enableCorrection: boolean
): Promise<{ ok: true; result: TranscribeResult } | { ok: false; status: number; message: string }> {
  const formData = new FormData()
  formData.append(
    "file",
    options.file,
    options.filename ?? "recording.webm"
  )
  formData.append("model", VALSEA_MODELS.transcribe)
  if (language) formData.append("language", language)
  formData.append("enable_correction", String(enableCorrection))
  formData.append("enable_tags", String(options.enableTags ?? false))
  formData.append("response_format", "verbose_json")

  const key = getApiKey()
  const res = await fetch(`${BASE_URL}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "X-API-Key": key },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: parseTranscribeError(data, res.status),
    }
  }

  const verbose = data as {
    text?: string
    clarified_text?: string
    raw_transcript?: string
  }

  return {
    ok: true,
    result: {
      text: verbose.text ?? "",
      clarifiedText: verbose.clarified_text,
      rawTranscript: verbose.raw_transcript,
    },
  }
}

export async function valseaTranscribe(
  options: TranscribeOptions
): Promise<TranscribeResult> {
  const attempts = languageAttempts(options.language)
  let lastMessage = "Transcription failed"

  for (let i = 0; i < attempts.length; i++) {
    const lang = attempts[i]
    const enableCorrection =
      options.enableCorrection !== false && (i === 0 || lang !== undefined)

    const result = await transcribeOnce(
      options,
      lang,
      enableCorrection
    )

    if (result.ok) {
      const text =
        result.result.clarifiedText?.trim() ||
        result.result.text?.trim() ||
        result.result.rawTranscript?.trim() ||
        ""
      if (text) return result.result
      lastMessage = "No speech detected in the recording"
      continue
    }

    lastMessage = result.message
    if (result.status === 401) break
    if (result.status !== 400 && result.status !== 422) break
  }

  throw new Error(lastMessage)
}

export interface TranslateOptions {
  text: string
  target: string
  source?: string
}

export interface TranslateResult {
  translatedText: string
  sourceLanguage?: string
  targetLanguage?: string
}

const TRANSLATE_TIMEOUT_MS = 25_000

export async function valseaTranslate(
  options: TranslateOptions
): Promise<TranslateResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}/v1/translations`, {
      method: "POST",
      headers: authHeaders("application/json"),
      body: JSON.stringify({
        model: VALSEA_MODELS.translate,
        text: options.text,
        source: options.source ?? "auto",
        target: options.target,
        response_format: "verbose_json",
      }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Valsea translation timed out. Try again.")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(parseTranslateError(data, res.status))
  }

  const result = data as {
    translated_text?: string
    source_language?: string
    target_language?: string
  }

  return {
    translatedText: result.translated_text ?? "",
    sourceLanguage: result.source_language,
    targetLanguage: result.target_language,
  }
}
