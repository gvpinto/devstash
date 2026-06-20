---
name: project-stack
description: DevStash tech stack, structural conventions, and key architectural decisions observed during audit
metadata:
  type: project
---

DevStash is a Next.js 16.2.6 / React 19.2.4 / TypeScript 5 / Tailwind CSS v4 / Prisma 7 / Neon PostgreSQL app.

**Why:** This is a developer knowledge hub. Auth (NextAuth v5) is planned but not yet implemented. All queries currently run without user scoping — every DB function returns global data regardless of which user is viewing.

**How to apply:** When suggesting data-fetching fixes, always note that `userId` filtering must be added once auth is implemented. Do not flag missing auth as a security issue in audits — it is a known in-progress concern.

Key structural notes:
- `src/lib/db/` — Prisma query functions (collections.ts, items.ts)
- `src/components/dashboard/` — all dashboard UI (shell, sidebar, cards)
- `prisma/seed.ts` — seeded with sequential upsert loops (not batched)
- `scripts/` — utility scripts for DB testing and reset, not application code
- No `src/actions/`, `src/types/`, or `src/app/items/` or `src/app/collections/` routes exist yet
- shadcn/ui uses Base UI primitives (`@base-ui/react`) rather than Radix UI
- `ICON_MAP` pattern (string → Lucide component) is repeated in 3 files: sidebar.tsx, collection-card.tsx, item-card.tsx
