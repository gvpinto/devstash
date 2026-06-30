import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { getItemById } from '@/lib/db/items'

const mockFindFirst = vi.mocked(prisma.item.findFirst)

const baseItem = {
  id: 'item_1',
  title: 'useDebounce Hook',
  description: 'Debounces a value by a given delay',
  content: 'export function useDebounce(...) {}',
  url: null,
  language: 'typescript',
  isFavorite: true,
  isPinned: false,
  createdAt: new Date('2026-05-16'),
  updatedAt: new Date('2026-05-16'),
  itemType: { icon: 'Code', color: '#3b82f6', name: 'Snippets' },
  tags: [{ tag: { name: 'react' } }, { tag: { name: 'hooks' } }],
  collections: [{ collection: { id: 'col_1', name: 'React Patterns' } }],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getItemById', () => {
  it('returns a mapped ItemDetail when the item exists for the user', async () => {
    mockFindFirst.mockResolvedValue(baseItem)

    const result = await getItemById('item_1', 'user_1')

    expect(result).toEqual({
      id: 'item_1',
      title: 'useDebounce Hook',
      description: 'Debounces a value by a given delay',
      content: 'export function useDebounce(...) {}',
      url: null,
      language: 'typescript',
      isFavorite: true,
      isPinned: false,
      createdAt: new Date('2026-05-16'),
      updatedAt: new Date('2026-05-16'),
      typeIcon: 'Code',
      typeColor: '#3b82f6',
      typeName: 'Snippets',
      tags: ['react', 'hooks'],
      collections: [{ id: 'col_1', name: 'React Patterns' }],
    })
  })

  it('returns null when the item does not exist', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await getItemById('nonexistent', 'user_1')

    expect(result).toBeNull()
  })

  it('queries with both id and userId to prevent cross-user access', async () => {
    mockFindFirst.mockResolvedValue(null)

    await getItemById('item_1', 'user_2')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item_1', userId: 'user_2' },
      })
    )
  })

  it('flattens tags from nested tag objects into an array of strings', async () => {
    mockFindFirst.mockResolvedValue({
      ...baseItem,
      tags: [{ tag: { name: 'a' } }, { tag: { name: 'b' } }, { tag: { name: 'c' } }],
    })

    const result = await getItemById('item_1', 'user_1')

    expect(result?.tags).toEqual(['a', 'b', 'c'])
  })

  it('returns empty arrays for tags and collections when none exist', async () => {
    mockFindFirst.mockResolvedValue({ ...baseItem, tags: [], collections: [] })

    const result = await getItemById('item_1', 'user_1')

    expect(result?.tags).toEqual([])
    expect(result?.collections).toEqual([])
  })
})
