import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/items', () => ({
  updateItemById: vi.fn(),
}))

import { auth } from '@/auth'
import { updateItemById } from '@/lib/db/items'
import { updateItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'

const mockAuth = vi.mocked(auth)
const mockUpdateItemById = vi.mocked(updateItemById)

const mockSession = { user: { id: 'user_1', name: 'Test', email: 't@t.com', emailVerified: null } }

const baseDetail: ItemDetail = {
  id: 'item_1',
  title: 'Updated Title',
  description: null,
  content: 'const x = 1',
  url: null,
  language: 'typescript',
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2026-06-30'),
  updatedAt: new Date('2026-06-30'),
  tags: ['react'],
  collections: [],
  typeIcon: 'Code',
  typeColor: '#3b82f6',
  typeName: 'Snippets',
}

beforeEach(() => vi.clearAllMocks())

describe('updateItem', () => {
  it('returns unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null)

    const result = await updateItem('item_1', { title: 'Test', tags: [] })

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockUpdateItemById).not.toHaveBeenCalled()
  })

  it('returns validation error when title is empty', async () => {
    mockAuth.mockResolvedValue(mockSession as never)

    const result = await updateItem('item_1', { title: '', tags: [] })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('Title is required')
    expect(mockUpdateItemById).not.toHaveBeenCalled()
  })

  it('returns validation error when URL is not a valid URL', async () => {
    mockAuth.mockResolvedValue(mockSession as never)

    const result = await updateItem('item_1', { title: 'Test', url: 'not-a-url', tags: [] })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('URL must be a valid URL')
    expect(mockUpdateItemById).not.toHaveBeenCalled()
  })

  it('converts an empty url string to null', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockUpdateItemById.mockResolvedValue(baseDetail)

    await updateItem('item_1', { title: 'Test', url: '', tags: [] })

    expect(mockUpdateItemById).toHaveBeenCalledWith(
      'item_1',
      'user_1',
      expect.objectContaining({ url: null })
    )
  })

  it('returns not-found error when the item does not belong to the user', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockUpdateItemById.mockResolvedValue(null)

    const result = await updateItem('item_1', { title: 'Test', tags: [] })

    expect(result).toEqual({ success: false, error: 'Item not found or access denied' })
  })

  it('returns success with the updated item on valid input', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockUpdateItemById.mockResolvedValue(baseDetail)

    const result = await updateItem('item_1', {
      title: 'Updated Title',
      content: 'const x = 1',
      language: 'typescript',
      tags: ['react'],
    })

    expect(result).toEqual({ success: true, data: baseDetail })
    expect(mockUpdateItemById).toHaveBeenCalledWith(
      'item_1',
      'user_1',
      expect.objectContaining({ title: 'Updated Title', tags: ['react'] })
    )
  })

  it('returns validation error when tags array contains empty strings', async () => {
    mockAuth.mockResolvedValue(mockSession as never)

    const result = await updateItem('item_1', { title: 'Test', tags: ['react', ''] })

    expect(result.success).toBe(false)
    expect(mockUpdateItemById).not.toHaveBeenCalled()
  })
})
