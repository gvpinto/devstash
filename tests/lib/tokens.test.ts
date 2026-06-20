import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { verifyToken, verifyPasswordResetToken } from '@/lib/tokens'

const mockFindUnique = vi.mocked(prisma.verificationToken.findUnique)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('verifyToken', () => {
  it('returns valid:true for an unexpired token', async () => {
    mockFindUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'abc123',
      expires: new Date(Date.now() + 60_000),
    })

    const result = await verifyToken('user@example.com', 'abc123')
    expect(result).toEqual({ valid: true })
  })

  it('returns valid:false with reason "invalid" when not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await verifyToken('user@example.com', 'bad-token')
    expect(result).toEqual({ valid: false, reason: 'invalid' })
  })

  it('returns valid:false with reason "expired" when token is past expiry', async () => {
    mockFindUnique.mockResolvedValue({
      identifier: 'user@example.com',
      token: 'abc123',
      expires: new Date(Date.now() - 1000),
    })

    const result = await verifyToken('user@example.com', 'abc123')
    expect(result).toEqual({ valid: false, reason: 'expired' })
  })
})

describe('verifyPasswordResetToken', () => {
  it('uses reset: prefix for identifier lookup', async () => {
    mockFindUnique.mockResolvedValue(null)

    await verifyPasswordResetToken('user@example.com', 'tok')

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: 'reset:user@example.com', token: 'tok' } },
    })
  })
})
