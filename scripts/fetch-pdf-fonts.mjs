/**
 * Download Noto fonts for multilingual PDF reports (Hindi, Marathi - Devanagari).
 * Run: node scripts/fetch-pdf-fonts.mjs
 */
import fs from "node:fs"
import path from "node:path"

const fonts = {
  "NotoSansDevanagari-Regular.ttf":
    "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf",
}

const outDir = path.join(process.cwd(), "public", "fonts")
fs.mkdirSync(outDir, { recursive: true })

for (const [name, url] of Object.entries(fonts)) {
  const dest = path.join(outDir, name)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${name}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  console.log(`Wrote ${name} (${buf.length} bytes)`)
}

console.log("PDF fonts ready in public/fonts/")
