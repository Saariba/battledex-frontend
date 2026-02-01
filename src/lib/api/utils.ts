/**
 * Utility functions for API data processing
 */

/**
 * Parse context from backend text format
 * Format: "(Name): text. [Name]: text. (Name): text."
 * - Parentheses () = context lines
 * - Brackets [] = core line
 */
export function parseContextFromText(text: string): string[] {
  const lines: string[] = []
  const regex = /[\(\[]([^\)\]]+)[\)\]]: ([^\.]+\.?)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const lineText = match[2].trim()
    if (lineText) {
      lines.push(lineText)
    }
  }

  return lines.length > 0 ? lines : [text]
}

/**
 * Extract league from battle title
 * Format: "Rapper1 vs Rapper2 (League)"
 */
export function extractLeague(battleTitle: string): string {
  const match = battleTitle.match(/\(([^)]+)\)$/)
  return match ? match[1] : 'Unknown'
}

/**
 * Generate deterministic ID from string
 * Normalizes to lowercase and replaces spaces/special chars with hyphens
 */
export function generateId(prefix: string, value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${prefix}-${normalized}`
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Generate YouTube thumbnail URL from video URL
 */
export function extractYouTubeThumbnail(videoUrl: string): string | undefined {
  const videoId = extractYouTubeId(videoUrl)
  if (!videoId) return undefined

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}
