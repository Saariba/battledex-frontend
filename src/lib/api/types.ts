/**
 * Backend API type definitions
 * These types match the FastAPI backend response format
 */

export interface BackendSearchRequest {
  query: string
  top_k?: number
  offset?: number
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
  context_lines?: string[]
  rapper?: string
  battle_id?: string
  battle_title: string
  video_url: string
  timestamp: number
  timestamp_str: string
  line_number?: number
  youtube_timestamp_link: string
  score: number
  type: 'semantic' | 'exact' | 'random'
  youtube_views?: number | null
}

export interface BackendSearchResponse {
  query: string
  total: number
  total_text_matches: number
  results: BackendSearchResultItem[]
  rapper_counts: Record<string, number>
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

export interface DailyQuizPayload {
  quiz_id: string
  day_key: string
  line: string
  line_id: number
  battle_id: string
  video_url: string
  timestamp: number
  hint_1_platform: string
  hint_2_year: number | null
  hint_3_context_before: string | null
  hint_3_context_after: string | null
  hint_4_opponent: string | null
}

export interface DailyQuizGuessRequest {
  quiz_id: string
  guess_name: string
  prior_guesses: string[]
}

export interface DailyQuizGuessResponse {
  correct: boolean
  guesses_used: number
  guesses_remaining: number
  completed: boolean
  correct_rapper_name: string | null
  battle_title: string | null
}

export interface QuizRapperSuggestion {
  id: string
  name: string
}

export interface QuizRapperSuggestionsResponse {
  suggestions: QuizRapperSuggestion[]
}

export interface DailyChallengeLinePayload {
  challenge_id: string
  day_key: string
  line_index: number
  total_lines: number
  line: string
  line_id: number
  battle_id: string
  video_url: string
  timestamp: number
  hint_1_platform: string
  hint_2_year: number | null
  hint_3_context_before: string | null
  hint_3_context_after: string | null
  hint_4_opponent: string | null
}

export interface DailyChallengeGuessRequest {
  challenge_id: string
  line_index: number
  guess_name: string
  prior_guesses: string[]
}

export interface DailyChallengeGuessResponse {
  correct: boolean
  guesses_used: number
  guesses_remaining: number
  completed_line: boolean
  failed_run: boolean
  challenge_complete: boolean
  correct_rapper_name: string | null
  battle_title: string | null
}
