/** Client-side snapshot of the visible page for the help chatbot */

export type PageSnapshot = {
  pathname: string
  title: string
  headings: string[]
  metaDescription?: string
}

export function extractPageSnapshot(pathname: string): PageSnapshot {
  if (typeof document === "undefined") {
    return { pathname, title: "", headings: [] }
  }

  const headings: string[] = []
  document.querySelectorAll("h1, h2").forEach((el) => {
    const text = el.textContent?.trim()
    if (text && !headings.includes(text)) headings.push(text)
  })

  const meta = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content")

  return {
    pathname,
    title: document.title,
    headings: headings.slice(0, 8),
    metaDescription: meta ?? undefined,
  }
}

export function formatPageSnapshot(snapshot: PageSnapshot): string {
  const lines = [
    `Path: ${snapshot.pathname}`,
    snapshot.title ? `Browser title: ${snapshot.title}` : "",
    snapshot.headings.length
      ? `Visible headings: ${snapshot.headings.join(" | ")}`
      : "",
    snapshot.metaDescription
      ? `Meta description: ${snapshot.metaDescription}`
      : "",
  ]
  return lines.filter(Boolean).join("\n")
}
