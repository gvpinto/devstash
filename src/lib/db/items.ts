import { prisma } from '@/lib/prisma'

export interface ItemSummary {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  tags: string[]
  typeIcon: string
  typeColor: string
  typeName: string
}

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  itemType: { select: { icon: true, color: true, name: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const

type RawItem = {
  id: string
  title: string
  description: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  itemType: { icon: string; color: string; name: string }
  tags: { tag: { name: string } }[]
}

function toSummary(item: RawItem): ItemSummary {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    tags: item.tags.map((t) => t.tag.name),
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    typeName: item.itemType.name,
  }
}

export async function getPinnedItems(): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    select: itemSelect,
    orderBy: { createdAt: 'desc' },
  })
  return items.map(toSummary)
}

export async function getRecentItems(limit = 10): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    select: itemSelect,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return items.map(toSummary)
}
