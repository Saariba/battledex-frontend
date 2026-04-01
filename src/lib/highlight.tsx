import React from "react"

/**
 * Highlight matching keywords in text for exact/keyword matches
 */
export function highlightKeywords(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const queryWords = query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)

  if (queryWords.length === 0) return text

  const regex = /[\p{L}\p{N}_]+/gu

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let didHighlight = false

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]
    const tokenLower = token.toLocaleLowerCase()
    const shouldHighlight = queryWords.some((word) => tokenLower.includes(word))

    if (shouldHighlight) {
      parts.push(
        <span key={match.index} style={{ color: '#eab308' }} className="font-bold">
          {token}
        </span>
      )
      didHighlight = true
    } else {
      parts.push(token)
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return didHighlight ? parts : text
}
