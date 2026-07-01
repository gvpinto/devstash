import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { updateItemById } from '@/lib/db/items'

const mockFindFirst = vi.mocked(prisma.item.findFirst)
const mockUpdate = vi.mocked(prisma.item.update)

const baseUpdateResult = {
  id: 'item_1',
  title: 'New Title',
  description: 'A description',
  content: 'const x = 1',
  url: null,
  language: 'typescript',
  isFavorite: false,
  isPinned: true,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-30'),
  itemType: { icon: 'Code', color: '#3b82f6', name: 'Snippets' },
  tags: [{ tag: { name: 'react' } }, { tag: { name: 'hooks' } }],
  collections: [{ collection: { id: 'col_1', name: 'React Patterns' } }],
}

beforeEach(() => vi.clearAllMocks())

describe('updateItemById', () => {
  it('returns null when the item does not exist for the given user', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await updateItemById('item_1', 'user_2', {
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(result).toBeNull()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('queries ownership with both id and userId before updating', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item_1' })
    mockUpdate.mockResolvedValue(baseUpdateResult)

    await updateItemById('item_1', 'user_1', {
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    })

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item_1', userId: 'user_1' } })
    )
  })

  it('returns a mapped ItemDetail with flattened tags and collections', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item_1' })
    mockUpdate.mockResolvedValue(baseUpdateResult)

    const result = await updateItemById('item_1', 'user_1', {
      title: 'New Title',
      description: 'A description',
      content: 'const x = 1',
      url: null,
      language: 'typescript',
      tags: ['react', 'hooks'],
    })

    expect(result).toEqual({
      id: 'item_1',
      title: 'New Title',
      description: 'A description',
      content: 'const x = 1',
      url: null,
      language: 'typescript',
      isFavorite: false,
      isPinned: true,
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-30'),
      tags: ['react', 'hooks'],
      collections: [{ id: 'col_1', name: 'React Patterns' }],
      typeIcon: 'Code',
      typeColor: '#3b82f6',
      typeName: 'Snippets',
    })
  })

  it('includes deleteMany in the tag update to replace all existing tags', async () => {
    mockFindFirst.mockResolvedValue({ id: 'item_1' })
    mockUpdate.mockResolvedValue({ ...baseUpdateResult, tags: [] })

    await updateItemById('item_1', 'user_1', {
      title: 'Test',
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ['new-tag'],
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: expect.objectContaining({ deleteMany: {} }),
        }),
      })
    )
  })
})
