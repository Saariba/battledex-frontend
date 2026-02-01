/**
 * Backend API type definitions
 * These types match the FastAPI backend response format
 */

export interface BackendSearchRequest {
  query: string
  top_k?: number
  filters?: {
    rapper_name?: string
    league_name?: string
    battle_id?: string
  }
}

export interface BackendSearchResultItem {
  text: string
  core_text?: string
  rapper?: string
  battle_title: string
  video_url: string
  timestamp: number
  timestamp_str: string
  line_number?: number
  youtube_timestamp_link: string
  score: number
  type: 'semantic' | 'exact'
}

export interface BackendSearchResponse {
  query: string
  total: number
  results: BackendSearchResultItem[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
