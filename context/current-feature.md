# Current Feature

Dashboard UI Phase 3 — Main content area with stats, recent collections, pinned items, and recent items.

## Status

In Progress

## Goals

- 4 stats cards at the top (total items, collections, favorite items, favorite collections)
- Recent collections section
- Pinned items section
- 10 most recent items section

## Notes

- Use mock data from `src/lib/mock-data.ts` directly until database is implemented
- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Spec: `context/features/dashboard-phase-3-spec.md`

## History

<!-- Keep this updated. Earliest to the lastest -->

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
