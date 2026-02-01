
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
  battleId: string;
  rapperId: string;
  line: string;
  context: string[];
  timestamp: number; // in seconds
  score?: number;
}

export interface SearchResult extends Punchline {
  battle: Battle;
  rapper: Rapper;
}
