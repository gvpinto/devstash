# DevStash — Project Overview

> A fast, searchable, AI-enhanced hub for developer knowledge and resources.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Target Users](#target-users)
3. [Tech Stack](#tech-stack)
4. [Data Models](#data-models)
5. [Features](#features)
6. [Item Types](#item-types)
7. [UI/UX Spec](#uiux-spec)
8. [Monetization](#monetization)
9. [AI Features](#ai-features)
10. [Key Links](#key-links)

---

## Problem Statement

Developers keep their essentials scattered across too many tools:

| Resource              | Current Home                 |
| --------------------- | ---------------------------- |
| Code snippets         | VS Code, Notion              |
| AI prompts            | Chat history                 |
| Context files         | Buried in project folders    |
| Useful links          | Browser bookmarks            |
| Docs/notes            | Random folders               |
| Commands              | `.txt` files or bash history |
| Templates/boilerplate | GitHub Gists                 |

This causes context switching, lost knowledge, and inconsistent workflows. **DevStash** is one fast, searchable, AI-enhanced hub for all of it.

---

## Target Users

| User Type                      | Primary Need                                           |
| ------------------------------ | ------------------------------------------------------ |
| **Everyday Developer**         | Fast access to snippets, prompts, commands, links      |
| **AI-first Developer**         | Organize prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes          |
| **Full-stack Builder**         | Collect patterns, boilerplates, API examples           |

---

## Tech Stack

| Layer            | Choice                                                             |
| ---------------- | ------------------------------------------------------------------ |
| **Framework**    | [Next.js 16](https://nextjs.org/) / React 19                       |
| **Language**     | TypeScript                                                         |
| **Database**     | [Neon](https://neon.tech/) (PostgreSQL)                            |
| **ORM**          | [Prisma 7](https://www.prisma.io/docs)                             |
| **Auth**         | [NextAuth v5](https://authjs.dev/) — Email/password + GitHub OAuth |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/)             |
| **AI**           | [OpenAI](https://platform.openai.com/docs) — `gpt-4o-mini` model   |
| **CSS**          | [Tailwind CSS v4](https://tailwindcss.com/)                        |
| **Components**   | [shadcn/ui](https://ui.shadcn.com/)                                |
| **Caching**      | Redis (optional, TBD)                                              |
| **Rendering**    | SSR pages with dynamic components + API routes                     |

> ⚠️ **DB Rule:** Never use `db push`. Always create and run migrations explicitly in dev, then apply in prod.

---

## Data Models

### Prisma Schema

```prisma
model User {
  id                     String       @id @default(cuid())
  name                   String?
  email                  String?      @unique
  emailVerified          DateTime?
  image                  String?
  isPro                  Boolean      @default(false)
  stripeCustomerId       String?      @unique
  stripeSubscriptionId   String?      @unique
  createdAt              DateTime     @default(now())
  updatedAt              DateTime     @updatedAt

  accounts     Account[]
  sessions     Session[]
  items        Item[]
  collections  Collection[]
  itemTypes    ItemType[]
}

model ItemType {
  id        String  @id @default(cuid())
  name      String                        // e.g. "snippet", "prompt"
  icon      String                        // Lucide icon name
  color     String                        // hex color
  isSystem  Boolean @default(false)       // system types cannot be modified
  userId    String?                       // null for system types

  user      User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     Item[]
  collections Collection[] @relation("DefaultType")
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType                 // TEXT | FILE
  content     String?                     // text content (markdown)
  fileUrl     String?                     // Cloudflare R2 URL
  fileName    String?                     // original filename
  fileSize    Int?                        // bytes
  url         String?                     // for link type items
  description String?
  language    String?                     // e.g. "typescript", "python"
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId      String
  itemTypeId  String

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType    ItemType    @relation(fields: [itemTypeId], references: [id])
  tags        TagsOnItems[]
  collections ItemCollection[]
}

model Collection {
  id            String    @id @default(cuid())
  name          String                      // e.g. "React Hooks", "Prototype Prompts"
  description   String?
  isFavorite    Boolean   @default(false)
  defaultTypeId String?                     // default item type for new items
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  defaultType   ItemType? @relation("DefaultType", fields: [defaultTypeId], references: [id])
  items         ItemCollection[]
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item         Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]
}

model TagsOnItems {
  itemId String
  tagId  String

  item   Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}

enum ContentType {
  TEXT
  FILE
}
```

### Entity Relationship Overview

```
User
 ├── Items (1:many)
 │    ├── ItemType (many:1)
 │    ├── Tags (many:many via TagsOnItems)
 │    └── Collections (many:many via ItemCollection)
 └── Collections (1:many)
      └── Items (many:many via ItemCollection)
```

---

## Features

### Items

- Create, read, update, delete items of any type
- Items open in a **quick-access drawer** (no page navigation)
- **Markdown editor** for text-based types (snippet, note, prompt, command)
- **Syntax highlighting** for code blocks
- **File upload** for `file` and `image` types (stored in Cloudflare R2)
- **Import code** from a local file
- Pin items to top; mark as favorite
- Track recently used (`lastUsedAt`)
- View which collections an item belongs to
- Add/remove items to/from multiple collections

### Collections

- Create collections with optional description and default item type
- Items can belong to multiple collections
- Mark collections as favorite
- Color-coded collection cards based on dominant item type

### Search

Full-text search across:

- Item titles
- Item content
- Tags
- Item types

### Authentication

- Email/password sign-up and login
- GitHub OAuth
- Session management via NextAuth v5

### Export (Pro)

- Export all data as JSON or ZIP

---

## Item Types

System types are built-in and cannot be modified by users. Custom types will be added in a future release (Pro only).

| Type          | Icon         | Color               | Route             | Content |
| ------------- | ------------ | ------------------- | ----------------- | ------- |
| Snippet       | `Code`       | `#3b82f6` (blue)    | `/items/snippets` | text    |
| Prompt        | `Sparkles`   | `#8b5cf6` (purple)  | `/items/prompts`  | text    |
| Command       | `Terminal`   | `#f97316` (orange)  | `/items/commands` | text    |
| Note          | `StickyNote` | `#fde047` (yellow)  | `/items/notes`    | text    |
| Link          | `Link`       | `#10b981` (emerald) | `/items/links`    | url     |
| File _(Pro)_  | `File`       | `#6b7280` (gray)    | `/items/files`    | file    |
| Image _(Pro)_ | `Image`      | `#ec4899` (pink)    | `/items/images`   | file    |

> Icons are from [Lucide React](https://lucide.dev/icons/).

---

## UI/UX Spec

### Design Language

- **Dark mode by default**, light mode optional
- Modern, minimal, developer-focused aesthetic
- Clean typography, generous whitespace
- Subtle borders and shadows
- Reference apps: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)

### Screenshots

Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact and use it as a reference

- @context/screenshots/dashboard-ui-drawer.md
- @context/screenshots/dashboard-ui-main.md

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)   │  Main Content                  │
│                          │                                │
│  ▸ Snippets              │  [ Collection Cards — grid ]   │
│  ▸ Prompts               │                                │
│  ▸ Commands              │  ┌────────┐ ┌────────┐         │
│  ▸ Notes                 │  │React   │ │Python  │         │
│  ▸ Links                 │  │Patterns│ │Snippets│         │
│  ▸ Files (pro)           │  └────────┘ └────────┘         │
│  ▸ Images (pro)          │                                │
│                          │  [ Item Cards — color-coded ]  │
│  ── Collections ──       │                                │
│  ▸ React Patterns        │                                │
│  ▸ Context Files         │                                │
│  ▸ Python Snippets       │                                │
└──────────────────────────────────────────────────────────┘
                     ↕ Item Drawer (on item click)
```

- **Sidebar** — item type links + collection list; becomes a drawer on mobile
- **Collection cards** — background color reflects the dominant item type in that collection
- **Item cards** — border color matches item type color
- **Item drawer** — slides in from the right; used for create, view, and edit

### Micro-interactions

- Smooth transitions on drawer open/close
- Hover states on all cards
- Toast notifications for create/update/delete actions
- Loading skeletons for async data

### Responsive

- **Desktop-first** layout
- Sidebar collapses to a hamburger/drawer on mobile

---

## Monetization

### Free Tier

| Limit              | Value                             |
| ------------------ | --------------------------------- |
| Items              | 50 total                          |
| Collections        | 3                                 |
| Item types         | System types only (no file/image) |
| Search             | Basic                             |
| AI features        | ❌                                |
| File/image uploads | ❌                                |

### Pro Tier — $8/mo or $72/yr

| Feature                | Included             |
| ---------------------- | -------------------- |
| Items                  | Unlimited            |
| Collections            | Unlimited            |
| File & image uploads   | ✅                   |
| Custom item types      | ✅ _(later release)_ |
| AI auto-tagging        | ✅                   |
| AI code explanation    | ✅                   |
| AI prompt optimizer    | ✅                   |
| Data export (JSON/ZIP) | ✅                   |
| Priority support       | ✅                   |

> **Dev note:** During development, all users have Pro access.

Payments via [Stripe](https://stripe.com/docs). User model stores `stripeCustomerId` and `stripeSubscriptionId`.

---

## AI Features

All AI features are **Pro only** and powered by OpenAI `gpt-4o-mini`.

| Feature                  | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| **Auto-tag suggestions** | Suggests relevant tags when creating or editing an item        |
| **AI Summary**           | Generates a short summary of an item's content                 |
| **Explain This Code**    | Plain-English explanation of a code snippet                    |
| **Prompt Optimizer**     | Rewrites and improves AI prompts for clarity and effectiveness |

AI calls are handled via Next.js API routes (not exposed client-side).

---

## Key Links

| Resource        | URL                                  |
| --------------- | ------------------------------------ |
| Next.js         | https://nextjs.org/docs              |
| Prisma          | https://www.prisma.io/docs           |
| NextAuth v5     | https://authjs.dev                   |
| Neon (Postgres) | https://neon.tech/docs               |
| Cloudflare R2   | https://developers.cloudflare.com/r2 |
| Tailwind CSS v4 | https://tailwindcss.com/docs         |
| shadcn/ui       | https://ui.shadcn.com                |
| Lucide Icons    | https://lucide.dev/icons             |
| OpenAI API      | https://platform.openai.com/docs     |
| Stripe          | https://stripe.com/docs              |
