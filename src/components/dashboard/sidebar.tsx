'use client'

import Link from 'next/link'
import {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon,
  Star, Settings, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  mockUser,
  mockItemTypes,
  mockCollections,
  mockItemTypeCounts,
} from '@/lib/mock-data'

const ICON_MAP: Record<string, React.ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}

interface SidebarProps {
  onClose?: () => void
  className?: string
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const favorites = mockCollections.filter((c) => c.isFavorite)
  const recent = mockCollections.filter((c) => !c.isFavorite)
  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={cn('flex h-full flex-col bg-sidebar text-sidebar-foreground', className)}>
      {onClose && (
        <div className="flex items-center justify-end px-3 pt-3 md:hidden">
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Types */}
        <section>
          <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Types
          </p>
          <nav className="space-y-0.5">
            {mockItemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon]
              const count = mockItemTypeCounts[type.id] ?? 0
              const slug = type.name.toLowerCase()
              return (
                <Link
                  key={type.id}
                  href={`/items/${slug}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {Icon && <Icon className="size-3.5 shrink-0" style={{ color: type.color }} />}
                    {type.name}
                  </span>
                  <span className="text-xs text-sidebar-foreground/40">{count}</span>
                </Link>
              )
            })}
          </nav>
        </section>

        {/* Collections */}
        <section>
          <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Collections
          </p>

          {favorites.length > 0 && (
            <div className="mb-3">
              <p className="px-2 py-1 text-[11px] text-sidebar-foreground/30 font-medium">
                Favorites
              </p>
              <nav className="space-y-0.5">
                {favorites.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Star className="size-3 shrink-0 fill-yellow-400 text-yellow-400" />
                    <span className="truncate">{col.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {recent.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[11px] text-sidebar-foreground/30 font-medium">
                Recent
              </p>
              <nav className="space-y-0.5">
                {recent.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <span className="size-3 shrink-0" />
                    <span className="truncate">{col.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </section>
      </div>

      {/* User avatar */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight text-sidebar-foreground truncate">
              {mockUser.name}
            </p>
            <p className="text-[11px] text-sidebar-foreground/40 truncate">
              {mockUser.email}
            </p>
          </div>
          <Settings className="size-3.5 shrink-0 text-sidebar-foreground/40" />
        </div>
      </div>
    </div>
  )
}
