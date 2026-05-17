import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function truncate(s: string | null | undefined, len = 60): string {
  if (!s) return "—";
  return s.length > len ? s.slice(0, len) + "…" : s;
}

async function main() {
  console.log("🔌 Connecting to database…\n");

  // ── Item Types ────────────────────────────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`📦 Item Types (${itemTypes.length})`);
  for (const t of itemTypes) {
    console.log(`   ${t.color}  ${t.icon.padEnd(12)} ${t.name}`);
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany();
  console.log(`\n👤 Users (${users.length})`);
  for (const u of users) {
    console.log(`   ${u.name} <${u.email}>`);
    console.log(`      isPro=${u.isPro}  emailVerified=${u.emailVerified?.toISOString() ?? "null"}  password=${u.password ? "✓ set" : "✗ not set"}`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  console.log(`\n🏷  Tags (${tags.length}): ${tags.map((t) => t.name).join(", ")}`);

  // ── Collections with items ────────────────────────────────────────────────
  const collections = await prisma.collection.findMany({
    include: {
      defaultType: true,
      items: {
        include: {
          item: {
            include: {
              itemType: true,
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: { addedAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`\n📁 Collections (${collections.length})`);
  for (const c of collections) {
    const fav = c.isFavorite ? " ⭐" : "";
    console.log(`\n   ${c.name}${fav}  [default type: ${c.defaultType?.name ?? "none"}]`);
    console.log(`   ${c.description ?? ""}`);

    for (const { item: i } of c.items) {
      const tags = i.tags.map((t) => t.tag.name).join(", ");
      const pin  = i.isPinned   ? " 📌" : "";
      const star = i.isFavorite ? " ⭐" : "";
      const detail = i.url
        ? `→ ${i.url}`
        : truncate(i.content);

      console.log(`      • [${i.itemType.name.padEnd(8)}]${pin}${star} ${i.title}`);
      console.log(`           ${detail}`);
      if (tags) console.log(`           tags: ${tags}`);
    }
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalItems = await prisma.item.count();
  const pinnedItems = await prisma.item.count({ where: { isPinned: true } });
  const favItems = await prisma.item.count({ where: { isFavorite: true } });

  console.log(`\n📊 Totals`);
  console.log(`   items: ${totalItems}  pinned: ${pinnedItems}  favorites: ${favItems}`);
  console.log(`   collections: ${collections.length}  tags: ${tags.length}`);

  console.log("\n✅ All queries succeeded.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
