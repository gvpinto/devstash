import { prisma } from '@/lib/prisma'

const TYPE_ORDER = ['Snippet', 'Prompt', 'Command', 'Note', 'File', 'Image', 'Link']

export async function getProfileData(userId: string) {
  const [user, itemGroups, itemTypes, collectionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, password: true, createdAt: true },
    }),
    prisma.item.groupBy({
      by: ['itemTypeId'],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true, color: true },
    }),
    prisma.collection.count({ where: { userId } }),
  ])

  const countById = Object.fromEntries(itemGroups.map((g) => [g.itemTypeId, g._count._all]))

  const typeBreakdown = itemTypes
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.name)
      const bi = TYPE_ORDER.indexOf(b.name)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    .map((t) => ({ ...t, count: countById[t.id] ?? 0 }))

  const totalItems = itemGroups.reduce((sum, g) => sum + g._count._all, 0)

  return {
    user,
    totalItems,
    collectionCount,
    typeBreakdown,
    isEmailUser: !!user?.password,
  }
}
