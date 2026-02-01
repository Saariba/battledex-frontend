# BattleRapDB API Documentation

**Version:** 1.0
**Base URL:** `http://localhost:8000`
**Content-Type:** `application/json`

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Authentication](#2-authentication)
3. [Endpoints Overview](#3-endpoints-overview)
4. [Search API](#4-search-api) ⭐ Primary Endpoint
5. [Battles API](#5-battles-api)
6. [Rappers API](#6-rappers-api)
7. [Transcripts API](#7-transcripts-api)
8. [Corrections API](#8-corrections-api)
9. [Error Handling](#9-error-handling)
10. [TypeScript Types](#10-typescript-types)
11. [Code Examples](#11-code-examples)

---

## 1. Getting Started

### Starting the API Server

The backend team runs:
```bash
uv run python -m battlerapdb.api.main
```

The API will be available at `http://localhost:8000`.

### Verify Connection

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### CORS

The API allows all origins (`*`) for development. All standard HTTP methods and headers are permitted.

---

## 2. Authentication

**None required.** The API is currently public with no authentication.

---

## 3. Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/search` | **Search punchlines** ⭐ |
| `GET` | `/api/v1/battles` | List all battles |
| `GET` | `/api/v1/rappers` | List all rappers |
| `GET` | `/api/v1/battles/{id}/transcripts` | Get battle transcript |
| `POST` | `/api/v1/corrections` | Submit a lyric correction |
| `GET` | `/api/v1/corrections` | List corrections (admin) |
| `GET` | `/api/v1/corrections/{id}` | Get correction with context |
| `POST` | `/api/v1/corrections/{id}/review` | Approve/reject correction (admin) |

---

## 4. Search API

### `POST /api/v1/search`

**The primary endpoint.** Performs hybrid search (semantic AI + keyword matching) across all punchlines.

### Request

```http
POST /api/v1/search
Content-Type: application/json
```

#### Body Parameters

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | Search query (min 1 character) |
| `top_k` | integer | No | `10` | Number of results (1-100) |
| `filters` | object | No | `null` | Optional filters |
| `filters.rapper_name` | string | No | `null` | Filter by exact rapper name |

#### Example Request

```json
{
  "query": "Mutter Beleidigung",
  "top_k": 10,
  "filters": {
    "rapper_name": "Meidi"
  }
}
```

#### Minimal Request

```json
{
  "query": "Mutter Beleidigung"
}
```

### Response

```json
{
  "query": "Mutter Beleidigung",
  "total": 5,
  "results": [
    {
      "text": "(Meidi): Es wundert mich nicht, dass du es schaffst... [Meidi]: Du schmieriger Bastard. Deine Mama ist die mieseste Kachba und dein Papa ärgert sich bis heute, dass er die Vasektomie nicht gemacht hat. (Meidi): Fick deine Mutter...",
      "core_text": "Du schmieriger Bastard. Deine Mama ist die mieseste Kachba und dein Papa ärgert sich bis heute, dass er die Vasektomie nicht gemacht hat.",
      "rapper": "Meidi",
      "battle_title": "Meidi vs Robscure (DLTLLY)",
      "video_url": "https://www.youtube.com/watch?v=wmnWMO8RvBQ",
      "timestamp": 484.0,
      "timestamp_str": "08:04",
      "line_number": 52,
      "youtube_timestamp_link": "https://www.youtube.com/watch?v=wmnWMO8RvBQ&t=484s",
      "score": 0.486,
      "type": "semantic"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `query` | string | The original search query |
| `total` | integer | Number of results returned |
| `results` | array | Array of search results |

### Result Object Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `text` | string | No | Full chunk with context lines. Format: `(Speaker): context` and `[Speaker]: core line` |
| `core_text` | string | Yes | **The main punchline.** Display this prominently. |
| `rapper` | string | Yes | Name of the rapper who said it |
| `battle_title` | string | No | Battle name, format: "Rapper1 vs Rapper2 (League)" |
| `video_url` | string | No | YouTube video URL (without timestamp) |
| `timestamp` | number | No | Timestamp in seconds (float) |
| `timestamp_str` | string | No | Formatted timestamp "MM:SS" |
| `line_number` | integer | Yes | Line number in the transcript (for reference) |
| `youtube_timestamp_link` | string | No | **Direct YouTube link at exact moment** |
| `score` | number | No | Relevance score (0.0 to 1.0, higher = better match) |
| `type` | string | No | `"semantic"` (AI similarity) or `"exact"` (keyword match) |

### Understanding `text` vs `core_text`

- **`core_text`**: The actual punchline that matched. Display this **large and bold**.
- **`text`**: The punchline with surrounding context from the same rapper. Show in a collapsible "Show Context" section.

The `text` field uses this format:
- `(Speaker): line` = Context line (before or after)
- `[Speaker]: line` = The core punchline

Example:
```
(Meidi): Previous line from Meidi.
[Meidi]: THIS IS THE CORE PUNCHLINE.
(Meidi): Next line from Meidi.
```

---

## 5. Battles API

### `GET /api/v1/battles`

Returns a list of all battles in the database.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `20` | Max results to return |
| `offset` | integer | `0` | Pagination offset |

### Example Request

```http
GET /api/v1/battles?limit=20&offset=0
```

### Response

```json
{
  "battles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Meidi vs Robscure (DLTLLY)",
      "video_url": "https://www.youtube.com/watch?v=wmnWMO8RvBQ",
      "event_date": null,
      "created_at": "2025-01-31T15:30:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Davie Jones vs BEASTBOY (DLTLLY)",
      "video_url": "https://www.youtube.com/watch?v=2gujsLjMnU0",
      "event_date": null,
      "created_at": "2025-01-31T15:25:00.000Z"
    }
  ],
  "count": 2
}
```

### Battle Object Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No | Unique battle identifier |
| `title` | string | No | Battle title with league |
| `video_url` | string | No | YouTube video URL |
| `event_date` | string (date) | Yes | Event date (YYYY-MM-DD) |
| `created_at` | string (datetime) | No | When record was created |

---

## 6. Rappers API

### `GET /api/v1/rappers`

Returns a list of all rappers. Useful for building filter dropdowns.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `50` | Max results to return |
| `offset` | integer | `0` | Pagination offset |

### Example Request

```http
GET /api/v1/rappers?limit=50&offset=0
```

### Response

```json
{
  "rappers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "BEASTBOY",
      "aka": [],
      "created_at": "2025-01-31T15:25:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Davie Jones",
      "aka": [],
      "created_at": "2025-01-31T15:25:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "name": "Meidi",
      "aka": [],
      "created_at": "2025-01-31T15:30:00.000Z"
    }
  ],
  "count": 6
}
```

### Rapper Object Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | No | Unique rapper identifier |
| `name` | string | No | Rapper name |
| `aka` | array of strings | No | Alternative names/aliases |
| `created_at` | string (datetime) | No | When record was created |

---

## 7. Transcripts API

### `GET /api/v1/battles/{battle_id}/transcripts`

Returns the full transcript for a specific battle. Use for the "Battle View" page with synced video playback.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `battle_id` | string (UUID) | Battle ID from `/api/v1/battles` |

### Example Request

```http
GET /api/v1/battles/550e8400-e29b-41d4-a716-446655440000/transcripts
```

### Response

```json
{
  "transcripts": [
    {
      "id": 1,
      "content": "Willkommen zum Battle!",
      "start_time": 5.0,
      "end_time": null,
      "sequence_index": 0,
      "speaker_label": "Host"
    },
    {
      "id": 2,
      "content": "Yo, ich fang mal an...",
      "start_time": 30.0,
      "end_time": null,
      "sequence_index": 1,
      "speaker_label": "Meidi"
    },
    {
      "id": 3,
      "content": "Du bist so schlecht...",
      "start_time": 35.0,
      "end_time": null,
      "sequence_index": 2,
      "speaker_label": "Meidi"
    }
  ],
  "count": 197
}
```

### Transcript Line Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Unique line ID |
| `content` | string | No | The spoken text |
| `start_time` | number | No | Timestamp in seconds |
| `end_time` | number | Yes | End timestamp (usually null) |
| `sequence_index` | integer | No | Line order (0-based) |
| `speaker_label` | string | Yes | Speaker name ("Meidi", "Host", etc.) |

---

## 8. Corrections API

The corrections system allows users to submit corrections for transcribed lyrics. Corrections are stored for admin review before being applied to the database.

### Workflow

1. User submits correction via `POST /api/v1/corrections`
2. Correction is stored with status `pending`
3. Admin reviews via `GET /api/v1/corrections` and `GET /api/v1/corrections/{id}`
4. Admin approves/rejects via `POST /api/v1/corrections/{id}/review`
5. If approved, the transcript is updated automatically

---

### `POST /api/v1/corrections`

Submit a correction for a transcript line.

#### Request

```http
POST /api/v1/corrections
Content-Type: application/json
```

```json
{
  "transcript_id": 123,
  "suggested_content": "Corrected lyric text here"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transcript_id` | integer | Yes | ID of the transcript line (from `/api/v1/battles/{id}/transcripts`) |
| `suggested_content` | string | Yes | The suggested corrected text |

#### Response

```json
{
  "id": 1,
  "message": "Correction submitted successfully. It will be reviewed by an admin."
}
```

#### Errors

| Code | When |
|------|------|
| 404 | Transcript ID not found |

---

### `GET /api/v1/corrections`

List corrections filtered by status (admin endpoint).

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `pending` | Filter: `pending`, `approved`, or `rejected` |
| `limit` | integer | `50` | Max results |

#### Example Request

```http
GET /api/v1/corrections?status=pending&limit=20
```

#### Response

```json
{
  "corrections": [
    {
      "id": 1,
      "transcript_id": 123,
      "original_content": "Original lyric text",
      "suggested_content": "Corrected lyric text",
      "status": "pending",
      "created_at": "2025-01-31T12:00:00Z",
      "reviewed_at": null,
      "reviewer_notes": null
    }
  ],
  "count": 5,
  "status": "pending"
}
```

---

### `GET /api/v1/corrections/{correction_id}`

Get a single correction with surrounding transcript context for review.

#### Response

```json
{
  "id": 1,
  "transcript_id": 123,
  "original_content": "Original lyric text",
  "suggested_content": "Corrected lyric text",
  "status": "pending",
  "created_at": "2025-01-31T12:00:00Z",
  "reviewed_at": null,
  "reviewer_notes": null,
  "context_before": [
    {
      "id": 121,
      "content": "Previous line 1",
      "sequence_index": 50,
      "speaker_label": "Meidi"
    },
    {
      "id": 122,
      "content": "Previous line 2",
      "sequence_index": 51,
      "speaker_label": "Meidi"
    }
  ],
  "context_after": [
    {
      "id": 124,
      "content": "Next line 1",
      "sequence_index": 53,
      "speaker_label": "Meidi"
    }
  ],
  "battle_title": "Meidi vs Robscure (DLTLLY)",
  "video_url": "https://www.youtube.com/watch?v=..."
}
```

#### Errors

| Code | When |
|------|------|
| 404 | Correction not found |

---

### `POST /api/v1/corrections/{correction_id}/review`

Approve or reject a correction (admin endpoint).

When approved, the transcript is updated with the suggested content.

#### Request

```http
POST /api/v1/corrections/1/review
Content-Type: application/json
```

```json
{
  "action": "approve",
  "reviewer_notes": "Verified against video"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | `approve` or `reject` |
| `reviewer_notes` | string | No | Optional notes about the decision |

#### Response

```json
{
  "success": true,
  "message": "Correction approved successfully",
  "correction_id": 1,
  "action": "approve"
}
```

#### Errors

| Code | When |
|------|------|
| 404 | Correction not found or already reviewed |

---

## 9. Error Handling

### Error Response Format

All errors return this structure:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Invalid input (e.g., missing `query` field) |
| `404` | Not Found | Resource doesn't exist (e.g., invalid battle ID) |
| `500` | Server Error | Internal error (check backend logs) |

### Example Error

```http
POST /api/v1/search
Content-Type: application/json

{"top_k": 10}
```

Response (400):
```json
{
  "detail": [
    {
      "loc": ["body", "query"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 10. TypeScript Types

Copy these types into your frontend project:

```typescript
// ============================================
// Search API Types
// ============================================

interface SearchFilters {
  rapper_name?: string;
}

interface SearchRequest {
  query: string;
  top_k?: number;        // Default: 10, Range: 1-100
  filters?: SearchFilters;
}

interface SearchResult {
  text: string;                    // Full context with surrounding lines
  core_text: string | null;        // THE PUNCHLINE - display prominently
  rapper: string | null;           // Rapper name
  battle_title: string;            // "Rapper1 vs Rapper2 (League)"
  video_url: string;               // YouTube URL (no timestamp)
  timestamp: number;               // Seconds (float)
  timestamp_str: string;           // "MM:SS" formatted
  line_number: number | null;      // Transcript line number
  youtube_timestamp_link: string;  // YouTube URL with timestamp
  score: number;                   // 0.0 - 1.0 relevance
  type: 'semantic' | 'exact';      // Match type
}

interface SearchResponse {
  query: string;
  total: number;
  results: SearchResult[];
}

// ============================================
// Battles API Types
// ============================================

interface Battle {
  id: string;              // UUID
  title: string;
  video_url: string;
  event_date: string | null;
  created_at: string;
}

interface BattlesResponse {
  battles: Battle[];
  count: number;
}

// ============================================
// Rappers API Types
// ============================================

interface Rapper {
  id: string;              // UUID
  name: string;
  aka: string[];
  created_at: string;
}

interface RappersResponse {
  rappers: Rapper[];
  count: number;
}

// ============================================
// Transcripts API Types
// ============================================

interface TranscriptLine {
  id: number;
  content: string;
  start_time: number;
  end_time: number | null;
  sequence_index: number;
  speaker_label: string | null;
}

interface TranscriptsResponse {
  transcripts: TranscriptLine[];
  count: number;
}

// ============================================
// Corrections API Types
// ============================================

interface CorrectionSubmitRequest {
  transcript_id: number;
  suggested_content: string;
}

interface CorrectionSubmitResponse {
  id: number;
  message: string;
}

interface Correction {
  id: number;
  transcript_id: number;
  original_content: string;
  suggested_content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

interface ContextLine {
  id: number;
  content: string;
  sequence_index: number;
  speaker_label: string | null;
}

interface CorrectionWithContext extends Correction {
  context_before: ContextLine[];
  context_after: ContextLine[];
  battle_title: string | null;
  video_url: string | null;
}

interface CorrectionReviewRequest {
  action: 'approve' | 'reject';
  reviewer_notes?: string;
}

interface CorrectionsListResponse {
  corrections: Correction[];
  count: number;
  status: string;
}

interface CorrectionReviewResponse {
  success: boolean;
  message: string;
  correction_id: number;
  action: 'approve' | 'reject';
}
```

---

## 11. Code Examples

### JavaScript/TypeScript Fetch Examples

#### Search for Punchlines

```typescript
async function searchPunchlines(
  query: string,
  options?: { topK?: number; rapper?: string }
): Promise<SearchResponse> {
  const response = await fetch('http://localhost:8000/api/v1/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      top_k: options?.topK ?? 10,
      filters: options?.rapper ? { rapper_name: options.rapper } : undefined
    })
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  return response.json();
}

// Usage
const results = await searchPunchlines('Mutter Beleidigung', { topK: 5 });
results.results.forEach(result => {
  console.log(`${result.rapper}: ${result.core_text}`);
  console.log(`  Watch: ${result.youtube_timestamp_link}`);
});
```

#### Get All Battles

```typescript
async function getBattles(limit = 20, offset = 0): Promise<BattlesResponse> {
  const response = await fetch(
    `http://localhost:8000/api/v1/battles?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch battles: ${response.status}`);
  }

  return response.json();
}

// Usage
const { battles } = await getBattles();
battles.forEach(battle => {
  console.log(`${battle.title} - ${battle.video_url}`);
});
```

#### Get Rappers (for Filter Dropdown)

```typescript
async function getRappers(): Promise<RappersResponse> {
  const response = await fetch('http://localhost:8000/api/v1/rappers');

  if (!response.ok) {
    throw new Error(`Failed to fetch rappers: ${response.status}`);
  }

  return response.json();
}

// Usage - Build filter dropdown
const { rappers } = await getRappers();
const rapperNames = rappers.map(r => r.name);
// ["BEASTBOY", "Davie Jones", "Meidi", "Robscure", ...]
```

#### Get Battle Transcript

```typescript
async function getTranscript(battleId: string): Promise<TranscriptsResponse> {
  const response = await fetch(
    `http://localhost:8000/api/v1/battles/${battleId}/transcripts`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transcript: ${response.status}`);
  }

  return response.json();
}

// Usage - Display transcript with timestamps
const { transcripts } = await getTranscript('550e8400-e29b-41d4-a716-446655440000');
transcripts.forEach(line => {
  const mins = Math.floor(line.start_time / 60);
  const secs = Math.floor(line.start_time % 60);
  console.log(`[${mins}:${secs.toString().padStart(2, '0')}] ${line.speaker_label}: ${line.content}`);
});
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useSearch(query: string, rapper?: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            top_k: 20,
            filters: rapper ? { rapper_name: rapper } : undefined
          })
        });

        if (!response.ok) throw new Error('Search failed');

        const data: SearchResponse = await response.json();
        setResults(data.results);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, rapper]);

  return { results, loading, error };
}

// Usage in component
function SearchPage() {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useSearch(query);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search punchlines..."
      />

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      {results.map((result, i) => (
        <div key={i}>
          <strong>{result.rapper}</strong>
          <p>{result.core_text}</p>
          <a href={result.youtube_timestamp_link}>
            Watch at {result.timestamp_str}
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

## Quick Reference

### Most Common Use Case: Search

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Mutter Beleidigung", "top_k": 5}'
```

### Display Priority

1. **`core_text`** → The punchline (big, bold, prominent)
2. **`rapper`** + **`timestamp_str`** → Attribution
3. **`youtube_timestamp_link`** → "Watch" button
4. **`text`** → Context (collapsible/expandable)
5. **`score`** → Relevance indicator
