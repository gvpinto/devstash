# Current Feature: Auth Phase 2 — Email/Password Credentials

## Status

In Progress

## Goals

- Add Credentials provider (email/password) to NextAuth v5 alongside existing GitHub OAuth
- Create `POST /api/auth/register` route — accepts name, email, password, confirmPassword
- Password hashed with bcryptjs (12 rounds); user stored in Neon via Prisma
- Registration validates passwords match and checks for existing email
- Split-config pattern preserved: `auth.config.ts` gets placeholder `authorize: () => null`, `auth.ts` overrides with real bcrypt validation
- Sign-in via `/api/auth/signin` with email/password redirects to `/dashboard`
- GitHub OAuth continues to work unchanged

## Notes

- `password String?` field already exists on `User` model (added in Seed Data phase)
- `bcryptjs` + `@types/bcryptjs` already installed
- Credentials provider must appear in `auth.config.ts` as a placeholder (edge-compatible) and be overridden in `auth.ts` with bcrypt logic — required by the split-config pattern
- Registration route: `/api/auth/register` (Next.js API route, not a Server Action)
- Return `{ success, error }` pattern from registration route

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

### 2026-05-17 — Dashboard Collections — Live Data

- Created `src/lib/db/collections.ts` — `getCollectionsForDashboard()` and `getDashboardStats()` Prisma fetch functions
- Collection card border color now derived from the most-used item type in each collection (not `defaultTypeId`)
- Updated `CollectionCard` component: removed mock data dependency, added `typeColor`/`typeName`/`typeIcons` props, renders small type icon row in card footer (max 4 icons + overflow count)
- Made `DashboardPage` async; replaced all mock collection/stats data with real Neon queries via `Promise.all`
- Stats cards now show live counts (items, collections, favorites)
- Items sections (Pinned, Recent) remain on mock data — separate feature

### 2026-05-16 — Seed Data

- Rewrote `prisma/seed.ts` per spec in `context/features/seed-spec.md`
- Added `password String?` to `User` model; migrated (`add_password_to_user`)
- Installed `bcryptjs` + `@types/bcryptjs`; demo user password hashed at 12 rounds
- Demo user: `demo@devstash.io`, `isPro: false`, `emailVerified` set on seed
- Seeded 7 system item types, 5 collections, 18 items (snippets, prompts, commands, links), 16 tags
- Added `db:seed` and `db:reset` npm scripts; added `prisma.seed` config to `package.json`
- Added `scripts/reset-db.ts` for clearing all data via Prisma `deleteMany` (avoids Neon pooler advisory lock limitation)
- Updated `scripts/test-db.ts` to display items grouped by collection with content previews and totals

### 2026-05-17 — Dashboard Items — Live Data

- Created `src/lib/db/items.ts` — `getPinnedItems()` and `getRecentItems()` Prisma fetch functions using `select` (not `include`) for efficient field projection
- Updated `ItemCard` component: removed `itemTypeId` + mock lookup, now accepts `typeIcon`/`typeColor`/`typeName` props directly; removed `mockItemTypes` dependency
- Updated `DashboardPage` to fetch pinned and recent items via `Promise.all`; removed all `mockItems` usage
- Pinned section conditionally hidden when no pinned items exist
- `mock-data.ts` is now unused for dashboard item rendering

### 2026-05-18 — Stats & Sidebar — Live Data

- Added `getSidebarData()` to `src/lib/db/items.ts` — fetches system item types with per-type item counts and collections with dominant type color for the sidebar
- Updated `Sidebar` component to accept `itemTypes`, `favoriteCollections`, `recentCollections` as props; removed all mock data imports
- Item types displayed in custom order: Snippets, Prompts, Commands, Notes, Files, Images, Links
- Favorite collections show a star icon; recent collections show a colored circle based on the most-used item type
- Added "View all collections" link at the bottom of the Collections section → `/collections`
- Made `DashboardLayout` async to fetch sidebar data server-side; passes `sidebarData` to `DashboardShell`
- `DashboardShell` accepts `sidebarData` prop and spreads it to `<Sidebar>` for both desktop and mobile drawer

### 2026-06-01 — Add Pro Badge to Sidebar

- Installed shadcn/ui `Badge` component (`src/components/ui/badge.tsx`)
- Updated `Sidebar` component to render a subtle outline "PRO" badge inline after the type name for Files and Images
- Badge uses `variant="outline"` with muted colors (`text-sidebar-foreground/40`, `border-sidebar-foreground/20`) and tight sizing (`h-4`, `text-[9px]`) to stay unobtrusive

### 2026-06-05 — Code Quality Quick Wins (Audit)

- Extracted shared `ICON_MAP` to `src/lib/icon-map.ts` — single source of truth used by `sidebar.tsx`, `collection-card.tsx`, and `item-card.tsx`; removed three duplicate local definitions
- Guarded `DATABASE_URL` in `src/lib/prisma.ts` — throws a clear error instead of silently passing `undefined` via non-null assertion
- Fixed index-based React `key` in `CollectionCard` icon row → stable `` `${icon}-${color}` `` key
- Removed redundant `'use client'` directive from `sidebar.tsx`
- Added `src/app/dashboard/loading.tsx` — animated skeleton matching the dashboard layout, shown during Neon cold-starts
- Added `aria-label={icon}` to each type icon in `CollectionCard` icon row for screen reader support
- Remaining audit items deferred: overfetch `select` rewrites (#2/#3), `typeName` render decision (#5), auth-gated items (#1/#8), sequential layout await (#9)

### 2026-06-09 — Auth Phase 1: NextAuth v5 + GitHub OAuth

- Installed `next-auth@beta` and `@auth/prisma-adapter`
- Created `src/auth.config.ts` — edge-compatible config with GitHub provider only (no adapter)
- Created `src/auth.ts` — full config with `PrismaAdapter`, `session: { strategy: 'jwt' }`, and callbacks to persist `user.id` through JWT into session
- Created `src/app/api/auth/[...nextauth]/route.ts` — exports `GET` and `POST` handlers
- Created `src/proxy.ts` — Next.js 16 proxy (named `proxy` export) wrapping edge-compatible auth; redirects unauthenticated users from `/dashboard/*` to `/api/auth/signin?callbackUrl=...`
- Created `src/types/next-auth.d.ts` — extends `Session` with `user.id: string`
- Generated `AUTH_SECRET` via `openssl rand -base64 32`; `.env.local` stores all three auth vars (gitignored)
- Split config pattern required due to Neon/Prisma not being edge-compatible; proxy imports only `auth.config.ts`

### 2026-05-16 — Dashboard UI Phase 3

- Stats cards: total items, collections, favorite items, favorite collections
- Collection cards: colored left border per default type, favorite star, item count badge, type label
- Item cards: colored type icon, title, description, tags, date with pin/star indicators
- Dashboard page composes all sections: stats, collections, pinned items, recent items
- Switched body font to Lato via `next/font/google`
