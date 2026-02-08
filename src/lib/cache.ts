interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // milliseconds
}

interface CacheOptions {
  maxSize?: number // Max entries (default 100)
  defaultTTL?: number // Default TTL in ms (default 5 min)
}

class Cache {
  private cache: Map<string, CacheEntry<any>>
  private maxSize: number
  private defaultTTL: number
  private accessOrder: string[] // For LRU eviction

  constructor(options: CacheOptions = {}) {
    this.cache = new Map()
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000 // 5 minutes
    this.accessOrder = []
  }

  /**
   * Get cached value if exists and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check expiration
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.accessOrder = this.accessOrder.filter(k => k !== key)
      return null
    }

    // Update LRU order
    this.updateAccessOrder(key)

    return entry.data as T
  }

  /**
   * Set cache entry with optional TTL override
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder[0]
      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.accessOrder.shift()
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })

    this.updateAccessOrder(key)
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Clear specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
      this.accessOrder = this.accessOrder.filter(k => k !== key)
    } else {
      this.cache.clear()
      this.accessOrder = []
    }
  }

  /**
   * Clear all keys matching a pattern (e.g., "search:*")
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.clear(key))
  }

  /**
   * Get cache stats for debugging
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    }
  }

  private updateAccessOrder(key: string): void {
    // Remove if exists
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    // Add to end (most recent)
    this.accessOrder.push(key)
  }
}

// Create singleton instances for different cache types
export const searchCache = new Cache({
  maxSize: 50,
  defaultTTL: 10 * 60 * 1000, // 10 minutes for search results
})

export const similarWordsCache = new Cache({
  maxSize: 100,
  defaultTTL: Infinity, // Never expire - similar words rarely change
})

export const transcriptCache = new Cache({
  maxSize: 20,
  defaultTTL: 30 * 60 * 1000, // 30 minutes for transcripts
})

export const battlesCache = new Cache({
  maxSize: 30,
  defaultTTL: 30 * 60 * 1000, // 30 minutes for battles
})

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, ...args: any[]): string {
  return `${prefix}:${args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(':')}`
}
