import Link from 'next/link'
import { Pin } from 'lucide-react'
import { getCollectionsForDashboard, getDashboardStats } from '@/lib/db/collections'
import { getPinnedItems, getRecentItems } from '@/lib/db/items'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CollectionCard } from '@/components/dashboard/collection-card'
import { ItemCard } from '@/components/dashboard/item-card'
import { ItemDrawerProvider } from '@/components/dashboard/item-drawer-provider'

export default async function DashboardPage() {
  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getCollectionsForDashboard(),
    getDashboardStats(),
    getPinnedItems(),
    getRecentItems(),
  ])

  return (
    <ItemDrawerProvider>
    <div className="space-y-8 max-w-5xl">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards
        totalItems={stats.totalItems}
        totalCollections={stats.totalCollections}
        favoriteItems={stats.favoriteItems}
        favoriteCollections={stats.favoriteCollections}
      />

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Collections</h2>
          <Link
            href="/collections"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              itemCount={col.itemCount}
              isFavorite={col.isFavorite}
              typeColor={col.typeColor}
              typeName={col.typeName}
              typeIcons={col.typeIcons}
            />
          ))}
        </div>
      </section>

      {/* Pinned items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                typeIcon={item.typeIcon}
                typeColor={item.typeColor}
                typeName={item.typeName}
                tags={item.tags}
                isFavorite={item.isFavorite}
                isPinned={item.isPinned}
                createdAt={item.createdAt}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent</h2>
          <Link
            href="/items"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              typeIcon={item.typeIcon}
              typeColor={item.typeColor}
              typeName={item.typeName}
              tags={item.tags}
              isFavorite={item.isFavorite}
              isPinned={item.isPinned}
              createdAt={item.createdAt}
            />
          ))}
        </div>
      </section>
    </div>
    </ItemDrawerProvider>
  )
}
