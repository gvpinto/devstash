import { Code, Pin, Star } from 'lucide-react'
import { ICON_MAP } from '@/lib/icon-map'

interface ItemCardProps {
  title: string
  description: string | null | undefined
  typeIcon: string
  typeColor: string
  typeName: string
  tags: string[]
  isFavorite: boolean
  isPinned: boolean
  createdAt: Date | string
}

export function ItemCard({
  title,
  description,
  typeIcon,
  typeColor,
  tags,
  isFavorite,
  isPinned,
  createdAt,
}: ItemCardProps) {
  const Icon = ICON_MAP[typeIcon] ?? Code
  const color = typeColor

  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors cursor-pointer">
      <div
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: color + '20' }}
      >
        <Icon className="size-3.5" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
          {isPinned && <Pin className="size-3 shrink-0 text-muted-foreground/50 fill-muted-foreground/30" />}
          {isFavorite && <Star className="size-3 shrink-0 fill-yellow-400 text-yellow-400" />}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="shrink-0 text-[11px] text-muted-foreground/50 mt-0.5">{date}</span>
    </div>
  )
}
