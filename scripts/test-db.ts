import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔌 Connecting to database...\n");

  // Item types
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`📦 Item types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`   ${t.icon}  ${t.name}  ${t.color}`);
  }

  // Users
  const users = await prisma.user.findMany();
  console.log(`\n👤 Users (${users.length}):`);
  for (const u of users) {
    console.log(`   ${u.name} <${u.email}>  isPro=${u.isPro}`);
  }

  // Collections
  const collections = await prisma.collection.findMany({
    include: { defaultType: true, items: true },
    orderBy: { name: "asc" },
  });
  console.log(`\n📁 Collections (${collections.length}):`);
  for (const c of collections) {
    console.log(`   ${c.name}  (${c.items.length} items)  type=${c.defaultType?.name ?? "none"}  fav=${c.isFavorite}`);
  }

  // Items with tags
  const items = await prisma.item.findMany({
    include: { itemType: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
  });
  console.log(`\n🗂  Items (${items.length}):`);
  for (const i of items) {
    const tagList = i.tags.map((t) => t.tag.name).join(", ");
    console.log(`   [${i.itemType.name}] ${i.title}  pinned=${i.isPinned}  tags=${tagList || "none"}`);
  }

  // Tags
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  console.log(`\n🏷  Tags (${tags.length}): ${tags.map((t) => t.name).join(", ")}`);

  console.log("\n✅ All queries succeeded.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
