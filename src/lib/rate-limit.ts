import "server-only"

/**
 * Rate limiter fixed-window sederhana di memori proses.
 *
 * Kenapa ada: rate limit bawaan Better Auth hanya berjalan untuk request HTTP
 * ke /api/auth/*, sedangkan login di aplikasi ini memanggil `auth.api.*`
 * langsung dari server action sehingga melewatinya.
 *
 * Batasan: state per instance server dan hilang saat restart. Untuk deploy
 * multi-instance / serverless ganti dengan storage bersama (Redis, tabel DB).
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function consumeRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  bucket.count += 1
  return { ok: true }
}

export function resetRateLimit(key: string) {
  buckets.delete(key)
}
