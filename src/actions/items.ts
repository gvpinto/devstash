'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { updateItemById } from '@/lib/db/items'
import type { ItemDetail } from '@/lib/db/items'

const updateItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional().transform((v) => v ?? null),
  content: z.string().nullable().optional().transform((v) => v ?? null),
  url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : (v ?? null)))
    .pipe(
      z
        .string()
        .url('URL must be a valid URL')
        .nullable()
    ),
  language: z.string().trim().nullable().optional().transform((v) => (v === '' ? null : (v ?? null))),
  tags: z.array(z.string().trim().min(1)).default([]),
})

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string }

export async function updateItem(
  itemId: string,
  raw: unknown
): Promise<UpdateItemResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = updateItemSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: message }
  }

  const updated = await updateItemById(itemId, session.user.id, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
  })

  if (!updated) {
    return { success: false, error: 'Item not found or access denied' }
  }

  return { success: true, data: updated }
}
