import Link from 'next/link'
import { Star, MoreHorizontal, Code, Sparkles, Terminal, StickyNote, File, Image, Link as Link2 } from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: Link2,
}

interface CollectionCardProps {
  id: string
  name: string
  description: string | null | undefined
  itemCount: number
  isFavorite: boolean
  typeColor: string
  typeName: string
  typeIcons: Array<{ icon: string; color: string }>
}

export function CollectionCard({
  id,
  name,
  description,
  itemCount,
  isFavorite,
  typeColor,
  typeName,
  typeIcons,
}: CollectionCardProps) {
  const visibleIcons = typeIcons.slice(0, 4)
  const overflow = typeIcons.length - visibleIcons.length

  return (
    <Link
      href={`/collections/${id}`}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-border/80 hover:bg-card/80 transition-colors"
      style={{ borderLeftColor: typeColor, borderLeftWidth: '3px' }}
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {visibleIcons.length > 0 && (
            <div className="flex items-center gap-1">
              {visibleIcons.map(({ icon, color }, i) => {
                const Icon = ICON_MAP[icon]
                return Icon ? (
                  <Icon key={i} className="size-3" style={{ color }} />
                ) : null
              })}
              {overflow > 0 && (
                <span className="text-[10px] text-muted-foreground/50">+{overflow}</span>
              )}
            </div>
          )}
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: typeColor + '20', color: typeColor }}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
        {typeName && (
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
            {typeName}
          </span>
        )}
      </div>
    </Link>
  )
}
