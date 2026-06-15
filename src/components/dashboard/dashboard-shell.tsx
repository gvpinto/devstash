'use client'

import { useState } from 'react'
import { Search, Plus, FolderPlus, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from './sidebar'
import type { SidebarData } from '@/lib/db/items'

interface SidebarUser {
  name: string | null
  email: string | null
  image: string | null
}

export function DashboardShell({
  children,
  sidebarData,
  user,
}: {
  children: React.ReactNode
  sidebarData: SidebarData
  user?: SidebarUser | null
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </button>

        <span className="text-sm font-semibold tracking-tight text-foreground">DevStash</span>

        <div className="mx-auto relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8 pr-14 h-7 text-sm bg-muted/40 border-border"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-muted px-1 text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FolderPlus />
            New Collection
          </Button>
          <Button size="sm">
            <Plus />
            New Item
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — inline, collapsible */}
        <aside
          className={
            'hidden md:flex md:flex-col shrink-0 border-r border-border overflow-hidden transition-[width] duration-200 ' +
            (open ? 'md:w-56' : 'md:w-0 md:border-r-0 md:invisible')
          }
        >
          <Sidebar {...sidebarData} user={user} />
        </aside>

        {/* Mobile drawer — always overlay */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 border-r border-sidebar-border shadow-xl">
              <Sidebar {...sidebarData} user={user} onClose={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
