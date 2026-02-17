
export interface Rapper {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Battle {
  id: string;
  title: string;
  league: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  date?: string;
}

export interface Punchline {
  id: string;
  battleId: string; // UUID from backend
  battleIdSlug?: string; // Generated slug for routing (optional)
  rapperId: string;
  line: string;
  context: string[];
  timestamp: number; // in seconds
  score?: number;
  type?: 'semantic' | 'exact' | 'random'; // Match type from backend
  line_number?: number; // Line number in transcript (for corrections)
}

export interface SearchResult extends Punchline {
  battle: Battle;
  rapper: Rapper;
}
