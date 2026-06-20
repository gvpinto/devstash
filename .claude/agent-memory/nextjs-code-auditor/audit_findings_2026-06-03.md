---
name: audit-findings-2026-06-03
description: Key findings from the first full codebase audit (June 2026) — patterns to watch in future work
metadata:
  type: project
---

First full audit completed 2026-06-03. Key recurring issues found:

**Why:** Recorded so future audits can check whether these have been fixed or have regressed.

**How to apply:** Re-check these specific patterns in future audits before declaring them resolved.

1. Missing userId filtering in ALL Prisma queries — getCollectionsForDashboard, getDashboardStats, getPinnedItems, getRecentItems, getSidebarData all return data for ALL users, not scoped to the logged-in user. Must be fixed when auth ships.

2. Overfetching in getCollectionsForDashboard (collections.ts line 15-27) — uses `include` with nested relations pulling full Item and ItemType rows. Should use `select` to fetch only needed fields.

3. Overfetching in getSidebarData (items.ts line 31-39) — fetches ALL collections with full item+itemType nesting just to compute dominant colors. No `take` limit applied.

4. ICON_MAP duplicated in three files — sidebar.tsx, collection-card.tsx, item-card.tsx. Should be extracted to a shared lib.

5. `typeName` prop accepted but never rendered in ItemCard (item-card.tsx line 28-37 destructure vs actual usage).

6. index key used on array rendering in collection-card.tsx line 64 — `key={i}` on `visibleIcons.map`.

7. Hardcoded "Demo User" / "demo@devstash.io" in sidebar.tsx lines 139-143 — must be replaced with real session data when auth ships.

8. process.env.DATABASE_URL with non-null assertion in prisma.ts line 13 — will throw at runtime with a cryptic error if env var is missing in production.

9. Seed script uses sequential `await` in loops (not parallelized) — acceptable for seed scripts, low priority.
