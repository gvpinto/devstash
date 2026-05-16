import Link from 'next/link'
import { Pin } from 'lucide-react'
import {
  mockCollections,
  mockItems,
  mockItemTypeCounts,
} from '@/lib/mock-data'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { CollectionCard } from '@/components/dashboard/collection-card'
import { ItemCard } from '@/components/dashboard/item-card'

const totalItems = Object.values(mockItemTypeCounts).reduce((a, b) => a + b, 0)
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length
const favoriteItems = mockItems.filter((i) => i.isFavorite).length

const pinnedItems = mockItems.filter((i) => i.isPinned)
const recentItems = [...mockItems]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  .slice(0, 10)

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards
        totalItems={totalItems}
        totalCollections={mockCollections.length}
        favoriteItems={favoriteItems}
        favoriteCollections={favoriteCollections}
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
          {mockCollections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              itemCount={col.itemCount}
              isFavorite={col.isFavorite}
              defaultTypeId={col.defaultTypeId}
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
                title={item.title}
                description={item.description}
                itemTypeId={item.itemTypeId}
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
              title={item.title}
              description={item.description}
              itemTypeId={item.itemTypeId}
              tags={item.tags}
              isFavorite={item.isFavorite}
              isPinned={item.isPinned}
              createdAt={item.createdAt}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
