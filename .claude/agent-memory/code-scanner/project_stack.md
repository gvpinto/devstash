---
name: project-stack
description: DevStash tech stack, structural conventions, and key architectural decisions observed during first audit
metadata:
  type: project
---

DevStash is a Next.js 16.2.6 / React 19.2.4 / TypeScript 5 / Tailwind CSS v4 / Prisma 7 / Neon PostgreSQL app.

**Why:** Developer knowledge hub. Auth (NextAuth v5) is planned but not yet implemented. All DB queries currently return global data (not user-scoped).

**How to apply:** When suggesting data-fetching fixes, always note userId filtering must be added once auth is implemented. Do not flag missing auth as a security issue.

Key structural notes:
- `src/lib/db/` — Prisma query functions (collections.ts, items.ts)
- `src/components/dashboard/` — all dashboard UI (shell, sidebar, cards)
- No `src/actions/`, `src/types/`, `src/app/items/` or `src/app/collections/` exist yet
- shadcn/ui uses Base UI primitives (`@base-ui/react`) rather than Radix UI
- `ICON_MAP` pattern (string → Lucide component) duplicated in 3 files: sidebar.tsx, collection-card.tsx, item-card.tsx
