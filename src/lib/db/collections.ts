import { prisma } from '@/lib/prisma'

export interface CollectionSummary {
  id: string
  name: string
  description: string | null
  isFavorite: boolean
  itemCount: number
  typeColor: string
  typeName: string
  typeIcons: Array<{ icon: string; color: string }>
}

export async function getCollectionsForDashboard(): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return collections.map((col) => {
    const itemTypes = col.items.map((ic) => ic.item.itemType)

    const typeCounts: Record<string, { count: number; icon: string; color: string; name: string }> = {}
    for (const t of itemTypes) {
      if (!typeCounts[t.id]) {
        typeCounts[t.id] = { count: 0, icon: t.icon, color: t.color, name: t.name }
      }
      typeCounts[t.id].count++
    }

    const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count)
    const dominant = sorted[0]

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      typeColor: dominant?.color ?? '#6b7280',
      typeName: dominant?.name ?? '',
      typeIcons: sorted.map(({ icon, color }) => ({ icon, color })),
    }
  })
}

export async function getDashboardStats() {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count(),
    prisma.collection.count(),
    prisma.item.count({ where: { isFavorite: true } }),
    prisma.collection.count({ where: { isFavorite: true } }),
  ])

  return { totalItems, totalCollections, favoriteItems, favoriteCollections }
}
