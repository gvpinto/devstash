import { prisma } from '@/lib/prisma'

export interface SidebarItemType {
  id: string
  name: string
  icon: string
  color: string
  itemCount: number
}

export interface SidebarCollection {
  id: string
  name: string
  isFavorite: boolean
  dominantColor: string
}

export interface SidebarData {
  itemTypes: SidebarItemType[]
  favoriteCollections: SidebarCollection[]
  recentCollections: SidebarCollection[]
}

export async function getSidebarData(): Promise<SidebarData> {
  const [itemTypes, collections] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: { _count: { select: { items: true } } },
    }),
    prisma.collection.findMany({
      include: {
        items: {
          include: {
            item: { include: { itemType: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const TYPE_ORDER = ['Snippets', 'Prompts', 'Commands', 'Notes', 'Files', 'Images', 'Links']
  itemTypes.sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.name)
    const bi = TYPE_ORDER.indexOf(b.name)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const sidebarItemTypes: SidebarItemType[] = itemTypes.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    itemCount: t._count.items,
  }))

  function getDominantColor(col: (typeof collections)[0]): string {
    const typeCounts: Record<string, { count: number; color: string }> = {}
    for (const { item } of col.items) {
      const t = item.itemType
      if (!typeCounts[t.id]) typeCounts[t.id] = { count: 0, color: t.color }
      typeCounts[t.id].count++
    }
    const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count)
    return sorted[0]?.color ?? '#6b7280'
  }

  const all: SidebarCollection[] = collections.map((col) => ({
    id: col.id,
    name: col.name,
    isFavorite: col.isFavorite,
    dominantColor: getDominantColor(col),
  }))

  return {
    itemTypes: sidebarItemTypes,
    favoriteCollections: all.filter((c) => c.isFavorite),
    recentCollections: all.filter((c) => !c.isFavorite).slice(0, 5),
  }
}

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

export interface ItemTypeHeader {
  id: string
  name: string
  icon: string
  color: string
}

export interface ItemDetail {
  id: string
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  tags: string[]
  collections: { id: string; name: string }[]
  typeIcon: string
  typeColor: string
  typeName: string
}

export async function getItemById(id: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { icon: true, color: true, name: true } },
      tags: { select: { tag: { select: { name: true } } } },
      collections: { select: { collection: { select: { id: true, name: true } } } },
    },
  })

  if (!item) return null

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => c.collection),
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    typeName: item.itemType.name,
  }
}

export interface UpdateItemInput {
  title: string
  description: string | null
  content: string | null
  url: string | null
  language: string | null
  tags: string[]
}

export async function updateItemById(
  id: string,
  userId: string,
  data: UpdateItemInput
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } })
  if (!existing) return null

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { icon: true, color: true, name: true } },
      tags: { select: { tag: { select: { name: true } } } },
      collections: { select: { collection: { select: { id: true, name: true } } } },
    },
  })

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collections.map((c) => c.collection),
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    typeName: item.itemType.name,
  }
}

export async function getItemsByType(
  slug: string
): Promise<{ itemType: ItemTypeHeader | null; items: ItemSummary[] }> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: { equals: slug, mode: 'insensitive' } },
    select: { id: true, name: true, icon: true, color: true },
  })

  if (!itemType) return { itemType: null, items: [] }

  const items = await prisma.item.findMany({
    where: { itemTypeId: itemType.id },
    select: itemSelect,
    orderBy: { createdAt: 'desc' },
  })

  return { itemType, items: items.map(toSummary) }
}
