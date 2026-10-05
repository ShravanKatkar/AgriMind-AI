import dns from "dns/promises"
import { MONGODB_DATABASE_NAME } from "@/lib/constants"

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])

/**
 * Convert mongodb+srv → mongodb:// using public DNS (fixes querySrv ECONNREFUSED on Windows).
 */
export async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri
  }

  const withoutScheme = uri.slice("mongodb+srv://".length)
  const at = withoutScheme.indexOf("@")
  if (at === -1) return uri

  const credentials = withoutScheme.slice(0, at)
  const rest = withoutScheme.slice(at + 1)
  const slash = rest.indexOf("/")
  const host = slash === -1 ? rest.split("?")[0] : rest.slice(0, slash)
  const pathAndQuery = slash === -1 ? "" : rest.slice(slash)

  const [srvRecords, txtRecords] = await Promise.all([
    dns.resolveSrv(`_mongodb._tcp.${host}`),
    dns.resolveTxt(host).catch(() => [] as string[][]),
  ])

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",")
  const txt = txtRecords.flat().join("")

  const params = new URLSearchParams()
  if (txt) {
    for (const part of txt.split("&")) {
      const [k, v] = part.split("=")
      if (k) params.set(k, v ?? "")
    }
  }

  const existing = pathAndQuery.includes("?") ? pathAndQuery.split("?")[1] : ""
  if (existing) {
    for (const part of existing.split("&")) {
      const [k, v] = part.split("=")
      if (k) params.set(k, v ?? "")
    }
  }

  params.set("ssl", "true")
  if (!params.has("authSource")) params.set("authSource", "admin")

  let dbPath = slash === -1 ? "" : pathAndQuery.split("?")[0]
  if (!dbPath || dbPath === "/") {
    dbPath = `/${MONGODB_DATABASE_NAME}`
  }

  const query = params.toString()
  return `mongodb://${credentials}@${hosts}${dbPath}?${query}`
}

/** Ensure SRV URI includes the agrimind database name and standard options. */
export function normalizeMongoEnvUri(uri: string): string {
  const trimmed = uri.trim()
  if (!trimmed.startsWith("mongodb+srv://")) return trimmed

  try {
    const u = new URL(trimmed.replace("mongodb+srv://", "https://"))
    if (!u.pathname || u.pathname === "/") {
      u.pathname = `/${MONGODB_DATABASE_NAME}`
    }
    if (!u.searchParams.has("retryWrites")) u.searchParams.set("retryWrites", "true")
    if (!u.searchParams.has("w")) u.searchParams.set("w", "majority")
    if (!u.searchParams.has("authSource")) u.searchParams.set("authSource", "admin")
    const rebuilt = `mongodb+srv://${u.username}:${u.password}@${u.hostname}${u.pathname}?${u.searchParams.toString()}`
    return rebuilt
  } catch {
    return trimmed
  }
}
