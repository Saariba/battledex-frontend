/**
 * Data transformation layer
 * Converts backend API format to frontend SearchResult format
 */

import type { SearchResult } from '@/lib/types'
import type { BackendSearchResultItem } from './types'
import {
  parseContextFromText,
  extractLeague,
  generateId,
  extractYouTubeThumbnail,
} from './utils'

/**
 * Transform backend search results to frontend format
 */
export function adaptBackendResults(
  backendItems: BackendSearchResultItem[]
): SearchResult[] {
  return backendItems.map((item) => adaptBackendResult(item))
}

/**
 * Transform a single backend result to frontend format
 */
function adaptBackendResult(item: BackendSearchResultItem): SearchResult {
  // Use UUID from backend or fallback to generated ID
  const battleId = item.battle_id || generateId('battle', item.battle_title)
  const battleIdSlug = generateId('battle', item.battle_title)
  const rapperId = item.rapper ? generateId('rapper', item.rapper) : 'rapper-unknown'
  const lineNumber = item.line_number ?? Math.floor(item.timestamp)
  // Include type in ID to differentiate semantic vs exact matches for the same line
  const resultId = `${battleIdSlug}-${rapperId}-${lineNumber}-${item.type}`

  // Parse context from text field
  const contextLines = parseContextFromText(item.text)

  // Extract league from battle title
  const league = extractLeague(item.battle_title)

  // Get thumbnail URL
  const thumbnailUrl = extractYouTubeThumbnail(item.video_url)

  return {
    id: resultId,
    battleId,
    battleIdSlug,
    rapperId,
    line: item.core_text || contextLines[0] || item.text,
    context: contextLines,
    timestamp: item.timestamp,
    score: item.score,
    type: item.type,
    line_number: item.line_number,
    battle: {
      id: battleIdSlug,
      title: item.battle_title,
      league,
      youtubeUrl: item.video_url,
      thumbnailUrl,
      date: undefined,
    },
    rapper: {
      id: rapperId,
      name: item.rapper || 'Unknown',
      avatarUrl: undefined,
    },
  }
}
