import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type Unit = 'ms' | 's' | 'm' | 'h' | 'd'
export type Duration = `${number} ${Unit}` | `${number}${Unit}`

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

export async function rateLimit(
  key: string,
  requests: number,
  window: Duration
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const redis = getRedis()
  if (!redis) return { success: true, remaining: requests, reset: 0 }

  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
    })
    const { success, remaining, reset } = await limiter.limit(key)
    return { success, remaining, reset }
  } catch {
    return { success: true, remaining: requests, reset: 0 }
  }
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function retryAfterSeconds(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000))
}
