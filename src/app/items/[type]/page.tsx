import { notFound } from 'next/navigation'
import { getItemsByType } from '@/lib/db/items'
import { ItemCard } from '@/components/dashboard/item-card'
import { ItemDrawerProvider } from '@/components/dashboard/item-drawer-provider'
import { ICON_MAP } from '@/lib/icon-map'
import { Code } from 'lucide-react'

interface Props {
  params: Promise<{ type: string }>
}

export default async function ItemsTypePage({ params }: Props) {
  const { type } = await params
  const { itemType, items } = await getItemsByType(type)

  if (!itemType) notFound()

  const Icon = ICON_MAP[itemType.icon] ?? Code

  return (
    <ItemDrawerProvider>
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: itemType.color + '20' }}
        >
          <Icon className="size-5" style={{ color: itemType.color }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{itemType.name}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {itemType.name.toLowerCase()} yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
    </ItemDrawerProvider>
  )
}
