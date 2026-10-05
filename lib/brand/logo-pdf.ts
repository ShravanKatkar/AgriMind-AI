import fs from "fs"
import path from "path"

let cachedLogoDataUrl: string | null | undefined

/** PNG logo as a data URL for jsPDF (server-side only). */
export function getAgriMindLogoDataUrl(): string | null {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl
  try {
    const logoPath = path.join(process.cwd(), "public", "agrimind-logo.png")
    const buffer = fs.readFileSync(logoPath)
    cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`
    return cachedLogoDataUrl
  } catch {
    cachedLogoDataUrl = null
    return null
  }
}
