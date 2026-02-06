interface CacheEntry<T> {
  data: T
  timestamp: number
  publicKey: string
}

const cache = new Map<string, CacheEntry<any>>()

const CACHE_DURATION = 60 * 1000

export function getCachedData<T>(key: string, publicKey: string): T | null {
  const cacheKey = `${key}_${publicKey}`
  const entry = cache.get(cacheKey)

  if (!entry) {
    return null
  }

  const now = Date.now()
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(cacheKey)
    return null
  }

  if (entry.publicKey !== publicKey) {
    cache.delete(cacheKey)
    return null
  }

  return entry.data
}

export function setCachedData<T>(
  key: string,
  publicKey: string,
  data: T
): void {
  const cacheKey = `${key}_${publicKey}`
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    publicKey,
  })
}

export function clearCache(key?: string, publicKey?: string): void {
  if (key && publicKey) {
    const cacheKey = `${key}_${publicKey}`
    cache.delete(cacheKey)
  } else {
    cache.clear()
  }
}
