/**
 * Backend API type definitions
 * These types match the FastAPI backend response format
 */

export interface BackendSearchRequest {
  query: string
  top_k?: number
  search_mode?: 'text' | 'semantic' | 'hybrid'
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
  battle_id?: string
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
  total_text_matches: number
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

// Corrections API Types
export interface CorrectionSubmitRequest {
  transcript_id: number
  suggested_content: string
}

export interface CorrectionSubmitResponse {
  id: number
  message: string
}

// Transcript API Types
export interface TranscriptLine {
  id: number
  content: string
  start_time: number
  end_time: number | null
  sequence_index: number
  speaker_label: string | null
}

export interface TranscriptsResponse {
  transcripts: TranscriptLine[]
  count: number
}

// Similar Words API Types
export interface SimilarWord {
  word: string
  count: number
}

export interface SimilarWordsResponse {
  query: string
  similar_words: SimilarWord[]
}
