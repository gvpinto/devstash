import type { ElementType } from 'react'
import { Code, Sparkles, Terminal, StickyNote, File, Image, Link as LinkIcon } from 'lucide-react'

export const ICON_MAP: Record<string, ElementType> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
}
