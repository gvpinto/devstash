# Current Feature

Seed Data

## Status

Complete

## Goals

- Rewrite `prisma/seed.ts` to match the spec in `context/features/seed-spec.md`
- Seed demo user with hashed password (bcryptjs, 12 rounds)
- Seed all 7 system item types
- Seed 5 collections with realistic content:
  - **React Patterns** — 3 TypeScript snippets
  - **AI Workflows** — 3 prompts
  - **DevOps** — 1 snippet, 1 command, 2 links
  - **Terminal Commands** — 4 commands
  - **Design Resources** — 4 links
- All seed operations must be idempotent (upsert)

## Notes

- User `isPro: false` (unlike old seed); `emailVerified` set to current date
- Password: `12345678` hashed with bcryptjs at 12 rounds — requires installing `bcryptjs` + `@types/bcryptjs`
- Links must use real, working URLs
- Item types: same 7 as before but `link` is last in the spec order
- Spec lives at `context/features/seed-spec.md`

## History

<!-- Keep this updated. Earliest to the latest -->

### 2026-05-11 — Initial Next.js Setup

- Bootstrapped project with `create-next-app` (Next.js 16, React 19, TypeScript 5, Tailwind CSS 4)
- Replaced default boilerplate: stripped `page.tsx`, `globals.css`, and default public SVGs
- Added `CLAUDE.md` with project context and stack documentation
- Added `context/` directory with `project-overview.md`, `coding-standards.md`, `ai-interaction.md`, and `current-feature.md`
- Pushed initial commits to `git@github.com:gvpinto/devstash.git`

### 2026-05-15 — Dashboard UI Phase 1

- Initialized shadcn/ui (v4.7) with Tailwind CSS v4 support
- Installed `Button` and `Input` components
- Created `/dashboard` route with `layout.tsx` and `page.tsx`
- Set dark mode as default via `dark` class on root `<html>` element
- Built top bar with centered search input, "New Collection" and "New Item" buttons (display only)
- Added sidebar and main area placeholders

### 2026-05-16 — Dashboard UI Phase 2

- Created `src/components/dashboard/sidebar.tsx` — types list with colored icons + counts + `/items/TYPE` links, favorites + recent collections, user avatar with settings icon
- Created `src/components/dashboard/dashboard-shell.tsx` — client shell with `PanelLeft` toggle, `⌘K` search hint, smooth width-transition collapse on desktop, overlay drawer on mobile
- Refactored `src/app/dashboard/layout.tsx` to use `DashboardShell`

### 2026-05-16 — Prisma + Neon PostgreSQL Setup

- Installed Prisma 7 (`prisma-client` provider, Rust-free) with `@prisma/adapter-neon` and Neon serverless driver
- Defined full schema: all core models + NextAuth v5 models (Account, Session, VerificationToken), indexes, cascade deletes
- Created `prisma.config.ts` with `defineConfig()` — `DATABASE_URL` lives here, not in `schema.prisma` (Prisma 7 breaking change)
- Generated client to `src/generated/prisma/client/` (import from `client/client`, no `index.ts` in Prisma 7)
- Applied initial migration to Neon dev branch via `prisma migrate dev --name init`
- Set up `src/lib/prisma.ts` — global singleton `PrismaClient` with `PrismaNeon` driver adapter + WebSocket support
- Added `prisma/seed.ts` with idempotent seed data (7 item types, 1 user, 6 collections, 5 items, 10 tags)
- Added `scripts/test-db.ts` to verify connectivity and seeded data
- Added `db:studio` and `postinstall` scripts to `package.json`

### 2026-05-16 — Dashboard UI Phase 3

- Stats cards: total items, collections, favorite items, favorite collections
- Collection cards: colored left border per default type, favorite star, item count badge, type label
- Item cards: colored type icon, title, description, tags, date with pin/star indicators
- Dashboard page composes all sections: stats, collections, pinned items, recent items
- Switched body font to Lato via `next/font/google`
