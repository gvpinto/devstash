import Link from 'next/link'
import { Star, MoreHorizontal } from 'lucide-react'
import { mockItemTypes } from '@/lib/mock-data'

interface CollectionCardProps {
  id: string
  name: string
  description: string | null | undefined
  itemCount: number
  isFavorite: boolean
  defaultTypeId: string | null | undefined
}

export function CollectionCard({
  id,
  name,
  description,
  itemCount,
  isFavorite,
  defaultTypeId,
}: CollectionCardProps) {
  const defaultType = mockItemTypes.find((t) => t.id === defaultTypeId)
  const accentColor = defaultType?.color ?? '#6b7280'

  return (
    <Link
      href={`/collections/${id}`}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-card/80 transition-colors"
      style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-foreground/90 truncate">
          {name}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {isFavorite && (
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          )}
          <MoreHorizontal className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
        {description ?? 'No description'}
      </p>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: accentColor + '20', color: accentColor }}
        >
          {itemCount} items
        </div>
        {defaultType && (
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
            {defaultType.name}
          </span>
        )}
      </div>
    </Link>
  )
}
