'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Code, Star, Pin, Copy, Pencil, Trash2, FolderOpen, Calendar, X, Save } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ICON_MAP } from '@/lib/icon-map'
import { updateItem } from '@/actions/items'
import type { ItemDetail } from '@/lib/db/items'

interface ItemDrawerProps {
  open: boolean
  itemId: string | null
  onClose: () => void
}

const CONTENT_TYPES = new Set(['snippets', 'prompts', 'commands', 'notes'])
const LANGUAGE_TYPES = new Set(['snippets', 'commands'])

function showsContent(typeName: string) {
  return CONTENT_TYPES.has(typeName.toLowerCase())
}

function showsLanguage(typeName: string) {
  return LANGUAGE_TYPES.has(typeName.toLowerCase())
}

function showsUrl(typeName: string) {
  return typeName.toLowerCase() === 'links'
}

export function ItemDrawer({ open, itemId, onClose }: ItemDrawerProps) {
  const router = useRouter()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (!open || !itemId) return
    let cancelled = false

    setLoading(true)
    setItem(null)
    setEditing(false)

    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          setItem(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, itemId])

  function enterEditMode() {
    if (!item) return
    setTitle(item.title)
    setDescription(item.description ?? '')
    setContent(item.content ?? '')
    setUrl(item.url ?? '')
    setLanguage(item.language ?? '')
    setTagsInput(item.tags.join(', '))
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function handleSave() {
    if (!item || !itemId) return
    setSaving(true)

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const result = await updateItem(itemId, {
      title,
      description: description || null,
      content: content || null,
      url: url || null,
      language: language || null,
      tags,
    })

    setSaving(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setItem(result.data)
    setEditing(false)
    toast.success('Item saved')
    router.refresh()
  }

  const Icon = item ? (ICON_MAP[item.typeIcon] ?? Code) : Code

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        {loading && <DrawerSkeleton />}
        {!loading && item && (
          <>
            {/* Header */}
            <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg mt-0.5"
                  style={{ backgroundColor: item.typeColor + '20' }}
                >
                  <Icon className="size-4.5" style={{ color: item.typeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-base font-semibold h-8 px-2"
                      placeholder="Title"
                    />
                  ) : (
                    <SheetTitle className="text-base font-semibold text-foreground leading-snug">
                      {item.title}
                    </SheetTitle>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: item.typeColor + '20', color: item.typeColor }}
                    >
                      {item.typeName}
                    </span>
                    {!editing && item.language && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {item.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action bar */}
              {editing ? (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                  >
                    <Save className="size-3.5" />
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 gap-1.5 text-xs ${item.isFavorite ? 'text-yellow-400 hover:text-yellow-400' : ''}`}
                  >
                    <Star className="size-3.5" fill={item.isFavorite ? 'currentColor' : 'none'} />
                    Favorite
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                    <Pin className="size-3.5" fill={item.isPinned ? 'currentColor' : 'none'} />
                    Pin
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                    <Copy className="size-3.5" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={enterEditMode}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive ml-auto"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              )}
            </SheetHeader>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {editing ? (
                <>
                  <section>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </section>

                  {showsContent(item.typeName) && (
                    <section>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Content
                      </label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Content"
                        rows={8}
                        className="text-sm font-mono resize-y"
                      />
                    </section>
                  )}

                  {showsUrl(item.typeName) && (
                    <section>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        URL
                      </label>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                        className="text-sm"
                      />
                    </section>
                  )}

                  {showsLanguage(item.typeName) && (
                    <section>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Language
                      </label>
                      <Input
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g. typescript"
                        className="text-sm"
                      />
                    </section>
                  )}

                  <section>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Tags
                    </label>
                    <Input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="react, hooks, typescript"
                      className="text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Comma-separated</p>
                  </section>

                  {item.collections.length > 0 && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Collections
                      </h3>
                      <div className="flex flex-col gap-1">
                        {item.collections.map((col) => (
                          <div key={col.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FolderOpen className="size-3.5" />
                            {col.name}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <>
                  {item.description && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Description
                      </h3>
                      <p className="text-sm text-foreground">{item.description}</p>
                    </section>
                  )}

                  {item.content && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Content
                      </h3>
                      <pre className="rounded-md bg-muted p-3 text-xs text-foreground overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono">
                        {item.content}
                      </pre>
                    </section>
                  )}

                  {item.url && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        URL
                      </h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline break-all"
                      >
                        {item.url}
                      </a>
                    </section>
                  )}

                  {item.tags.length > 0 && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {item.collections.length > 0 && (
                    <section>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        Collections
                      </h3>
                      <div className="flex flex-col gap-1">
                        {item.collections.map((col) => (
                          <div key={col.id} className="flex items-center gap-2 text-sm text-foreground">
                            <FolderOpen className="size-3.5 text-muted-foreground" />
                            {col.name}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Details
                    </h3>
                    <div className="flex flex-col gap-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>Created</span>
                        <span className="ml-auto text-foreground">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>Updated</span>
                        <span className="ml-auto text-foreground">
                          {new Date(item.updatedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 rounded bg-muted" />
        ))}
      </div>
      <div className="border-t border-border pt-4 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-24 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
