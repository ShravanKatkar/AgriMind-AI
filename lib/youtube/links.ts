export interface DiagnosisVideoLink {
  title: string
  searchQuery: string
  language?: string
  url: string
}

export function buildYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

export function toVideoLinks(
  videos: { title: string; searchQuery: string; language?: string }[]
): DiagnosisVideoLink[] {
  return videos.slice(0, 4).map((v) => ({
    title: v.title,
    searchQuery: v.searchQuery,
    language: v.language,
    url: buildYouTubeSearchUrl(v.searchQuery),
  }))
}
