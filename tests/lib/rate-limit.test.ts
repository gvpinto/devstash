import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClientIP, retryAfterSeconds, rateLimit } from '@/lib/rate-limit'

describe('getClientIP', () => {
  it('reads x-forwarded-for (first IP in chain)', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.10.11.12' },
    })
    expect(getClientIP(req)).toBe('9.10.11.12')
  })

  it('returns "unknown" when no IP header present', () => {
    const req = new Request('http://localhost')
    expect(getClientIP(req)).toBe('unknown')
  })
})

describe('retryAfterSeconds', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  it('returns seconds until reset', () => {
    const resetMs = Date.now() + 30_000
    expect(retryAfterSeconds(resetMs)).toBe(30)
  })

  it('returns at least 1 when reset is in the past', () => {
    const resetMs = Date.now() - 5_000
    expect(retryAfterSeconds(resetMs)).toBe(1)
  })

  it('rounds up fractional seconds', () => {
    const resetMs = Date.now() + 30_500
    expect(retryAfterSeconds(resetMs)).toBe(31)
  })
})

describe('rateLimit (fail-open when Redis unavailable)', () => {
  it('returns success:true when UPSTASH env vars are missing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const result = await rateLimit('test-key', 5, '1m')
    expect(result.success).toBe(true)
  })
})
