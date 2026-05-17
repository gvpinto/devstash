# Current Feature

Prisma + Neon PostgreSQL Setup

## Status

In Progress

## Goals

- Install Prisma 7 and configure with Neon serverless PostgreSQL
- Define Prisma schema: all data models from `project-overview.md` (User, ItemType, Item, Collection, ItemCollection, Tag, TagsOnItems, ContentType enum) plus NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create and run initial migration via `prisma migrate dev` (never `db push`)
- Set up Prisma client singleton in `src/lib/prisma.ts`
- Configure `.env` with `DATABASE_URL` pointing to Neon dev branch

## Notes

- Use Prisma 7 (breaking changes from v6 — review upgrade guide before implementing)
- Dev database = Neon dev branch (`DATABASE_URL`); prod = separate Neon production branch
- Always migrate; never `prisma db push`
- NextAuth models must match the Auth.js v5 adapter expectations

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

### 2026-05-16 — Dashboard UI Phase 3

- Stats cards: total items, collections, favorite items, favorite collections
- Collection cards: colored left border per default type, favorite star, item count badge, type label
- Item cards: colored type icon, title, description, tags, date with pin/star indicators
- Dashboard page composes all sections: stats, collections, pinned items, recent items
- Switched body font to Lato via `next/font/google`
